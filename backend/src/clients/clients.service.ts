import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.client.findMany({ orderBy: { id: 'asc' } });
  }

  findOne(id: number) {
    return this.prisma.client.findUnique({ where: { id } });
  }
}
