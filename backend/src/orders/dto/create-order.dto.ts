import { Type } from 'class-transformer';
import {
  IsInt,
  IsPositive,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';

export class OrderItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  clientId: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe agregar al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
