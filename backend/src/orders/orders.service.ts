import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({
      include: { client: true },
      orderBy: { id: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        details: {
          include: { product: true },
        },
      },
    });
  }

  async create(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const client = await tx.client.findUnique({ where: { id: dto.clientId } });
      if (!client) {
        throw new NotFoundException(`Cliente con ID ${dto.clientId} no encontrado`);
      }

      const products = await tx.product.findMany({
        where: { id: { in: dto.items.map((item) => item.productId) } },
      });
      const productById = new Map(products.map((product) => [product.id, product]));
      let total = new Prisma.Decimal(0);
      const detailsData: {
        productId: number;
        quantity: number;
        unitPrice: Prisma.Decimal;
        subtotal: Prisma.Decimal;
      }[] = [];

      for (const item of dto.items) {
        const product = productById.get(item.productId);
        if (!product) {
          throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);
        }
        const unitPrice = product.price;
        const subtotal = unitPrice.mul(item.quantity);
        total = total.add(subtotal);
        detailsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });
      }

      const order = await tx.order.create({
        data: {
          clientId: dto.clientId,
          status: 'PENDIENTE',
          total,
          details: {
            create: detailsData,
          },
        },
        include: {
          client: true,
          details: {
            include: { product: true },
          },
        },
      });

      return order;
    });
  }
}
