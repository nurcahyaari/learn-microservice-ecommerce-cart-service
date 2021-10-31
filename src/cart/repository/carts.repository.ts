import { EntityRepository, Repository } from 'typeorm';
import { Carts } from '../entity/carts';

@EntityRepository(Carts)
export class CartsRepository extends Repository<Carts> {
  GetExistingUserCartByVariantId(
    userId: number,
    variantId: number,
  ): Promise<Carts> {
    return this.findOne({
      where: {
        user_id: userId,
        product_variant_id: variantId,
      },
    });
  }
}
