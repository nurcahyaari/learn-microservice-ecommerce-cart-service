import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartsRepository } from './repository/carts.repository';
import { CartController } from './handlers/http/cart.controller';
import { ProductsModule } from 'src/external/products/products.module';
import { UserAuthMiddleware } from 'src/external/auth/user-auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartsRepository]),
    ProductsModule,
    CacheModule.register(),
  ],
  exports: [CartService],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthMiddleware).exclude().forRoutes(CartController);
  }
}
