import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { response } from 'express';
import { take } from 'rxjs';
import { ProductsService } from 'src/external/products/products.service';
import { ProductVariantFromExternal } from 'src/external/products/product_variant.dto';
import { DeleteResult, In } from 'typeorm';
import { CartPatchQuantity, CartProductRequest } from './dto/cart.dto';
import { Carts } from './entity/carts';
import { CartsRepository } from './repository/carts.repository';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartsRepository)
    private readonly cartsRepository: CartsRepository,
    private readonly productService: ProductsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  GetUserCart(user_id: number, cartIds: string[] | string): Promise<Carts[]> {
    if (typeof cartIds !== 'undefined') {
      return this.GetCartByCartIds(cartIds);
    }
    return this.cartsRepository.find({
      user_id: user_id,
    });
  }

  GetCartByCartIds(cartIds: string[] | string): Promise<Carts[]> {
    if (typeof cartIds === 'string') {
      return this.cartsRepository.find({
        cart_id: cartIds,
      });
    }
    return this.cartsRepository.find({
      cart_id: In(cartIds),
    });
  }

  GetProductVariantCart(varint_id: number): Promise<Carts> {
    return this.cartsRepository.findOne({
      where: {
        product_variant_id: varint_id,
      },
    });
  }

  async AddToCart(data: CartProductRequest, user_id: number): Promise<Error> {
    const cart = new Carts();

    const productVariant =
      await this.productService.GetProductVariantByVariantId(
        data.product_variant_id,
      );

    const existingCart =
      await this.cartsRepository.GetExistingUserCartByVariantId(
        user_id,
        data.product_variant_id,
      );

    if (existingCart) {
      data.quantity += existingCart.quantity;
      cart.cart_id = existingCart.cart_id;
    }

    if (data.quantity > productVariant.data.quantity) {
      return new Error('product_out_of_stock');
    }

    cart.quantity = data.quantity;
    cart.user_id = user_id;
    cart.product_variant_id = data.product_variant_id;
    cart.price = productVariant.data.price;
    this.cartsRepository.save(cart);

    return;
  }

  async PatchQuantityCart(
    cart_id: string,
    data: CartPatchQuantity,
  ): Promise<Carts | DeleteResult> {
    const cart = await this.cartsRepository.findOne({
      where: {
        cart_id: cart_id,
      },
    });

    if (data.quantity === 0) {
      return this.cartsRepository.delete(cart_id);
    }

    cart.quantity = data.quantity;
    this.cartsRepository.save(cart);

    return;
  }

  async DeleteBulkCart(
    userId: string,
    cartIds: string[],
  ): Promise<DeleteResult> {
    const userCart = await this.cartsRepository.find({
      where: {
        cart_id: In(cartIds),
      },
    });
    this.cacheManager.set(`${userId}-cart`, JSON.stringify(userCart));
    return this.cartsRepository.delete({
      cart_id: In(cartIds),
    });
  }

  async DeleteCartById(userId: string, cartId: string): Promise<DeleteResult> {
    const userCart = await this.cartsRepository.find({
      where: {
        cart_id: cartId,
      },
    });
    this.cacheManager.set(`${userId}-cart`, JSON.stringify(userCart));
    return this.cartsRepository.delete(cartId);
  }

  async CommitDeleteCart(userId: string): Promise<boolean> {
    try {
      await this.cacheManager.del(`${userId}-cart`);
      return true;
    } catch (e) {
      return e;
    }
  }

  async RollbackDeleteCart(userId: string): Promise<boolean> {
    try {
      const userCartCache: string = await this.cacheManager.get(
        `${userId}-cart`,
      );
      const userCart = JSON.parse(userCartCache);
      await this.cartsRepository.save(userCart);
      await this.cacheManager.del(`${userId}-cart`);
      return true;
    } catch (e) {
      return e;
    }
  }
}
