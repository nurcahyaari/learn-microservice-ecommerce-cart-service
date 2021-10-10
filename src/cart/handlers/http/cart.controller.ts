import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CartService } from 'src/cart/cart.service';
import {
  CartPatchQuantity,
  CartProductRequest,
  CartQueryParam,
  CartRequestParam,
} from 'src/cart/dto/cart.dto';
import { DeleteResult } from 'typeorm';

@Controller('/v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiBearerAuth('Authorization')
  @ApiQuery({ name: 'cart_ids', isArray: true, required: false })
  @Get('')
  GetUserCart(@Request() req, @Query() query: CartQueryParam) {
    return this.cartService.GetUserCart(
      req.headers.authorization.id,
      query.cart_ids,
    );
  }

  @ApiBearerAuth('Authorization')
  @Post('')
  async AddToCart(@Body() body: CartProductRequest, @Request() req) {
    const cart = await this.cartService.AddToCart(body, req.headers.user.id);
    if (cart) {
      if (cart.message === 'product_out_of_stock') {
        throw new InternalServerErrorException(cart.message);
      }
    }

    return 'success add to cart';
  }

  @ApiBearerAuth('Authorization')
  @Patch('/quantity/:cart_id')
  async PatchCartQuantity(
    @Param() param: CartRequestParam,
    @Body() body: CartPatchQuantity,
  ) {
    const resp = await this.cartService.PatchQuantityCart(param.cart_id, body);

    if (resp instanceof DeleteResult) {
      return 'success to delete cart';
    }

    return 'success to update quantity cart';
  }

  @ApiBearerAuth('Authorization')
  @ApiQuery({ name: 'cart_ids', isArray: true })
  @Delete('/bulk')
  async DeleteBulkUserCart(@Query() query: CartQueryParam, @Request() req) {
    try {
      const user = req.headers.user;
      const resp = await this.cartService.DeleteBulkCart(
        user.user_id,
        query.cart_ids,
      );

      if (!resp.affected) {
        return 'failed to delete cart';
      }

      return 'success to delete cart';
    } catch (e) {
      return e;
    }
  }

  @ApiBearerAuth('Authorization')
  @Delete('/:cart_id')
  async DeleteUserCart(@Param() param: CartRequestParam, @Request() req) {
    const user = req.headers.user;
    const resp = await this.cartService.DeleteCartById(
      user.user_id,
      param.cart_id,
    );

    if (!resp.affected) {
      return 'failed to delete cart';
    }

    return 'success to delete cart';
  }

  @ApiBearerAuth('Authorization')
  @Get('/transaction/delete/commit')
  async CommitTransactionDelete(@Request() req) {
    try {
      const user = req.headers.user;
      await this.cartService.CommitDeleteCart(user.user_id);
      return 'success';
    } catch (e) {
      return e;
    }
  }

  @ApiBearerAuth('Authorization')
  @Get('/transaction/delete/rollback')
  async RollbackTransactionDelete(@Request() req) {
    try {
      console.log('rollback');
      const user = req.headers.user;
      await this.cartService.RollbackDeleteCart(user.user_id);
      return 'success';
    } catch (e) {
      console.log('rollback failed');
      console.log(e);
      return e;
    }
  }
}
