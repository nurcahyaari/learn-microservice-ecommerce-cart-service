import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CartProductRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  product_variant_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CartRequestParam {
  @ApiProperty()
  @IsNotEmpty()
  cart_id: string;
}

export class CartQueryParam {
  @ApiProperty()
  @IsNotEmpty()
  cart_ids: string[];
}

export class CartPatchQuantity {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
