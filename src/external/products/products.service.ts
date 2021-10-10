import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ProductVariantFromExternal } from './product_variant.dto';

@Injectable()
export class ProductsService {
  private baseUrl: string;
  constructor() {
    this.baseUrl = process.env.SERVICE_PRODUCT_HOST;
  }

  async GetProductVariantByVariantId(
    variantId: number,
  ): Promise<AxiosResponse<ProductVariantFromExternal>> {
    const resp = await axios.get(
      `${this.baseUrl}/v1/products/product_variant/${variantId}`,
    );
    return resp;
  }
}
