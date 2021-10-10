import { BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum StockList {
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'not_available',
}

@Entity({ name: 'carts' })
export class Carts {
  @PrimaryGeneratedColumn('uuid', { name: 'cart_id' })
  cart_id: string;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'product_variant_id' })
  product_variant_id: number;

  @Column({ name: 'quantity' })
  quantity: number;

  @Column({ name: 'price' })
  price: number;

  @Column({
    name: 'date_add',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date_add: Date;

  @Column({
    type: 'enum',
    enum: StockList,
    default: StockList.AVAILABLE,
    name: 'available_stock',
  })
  available_stock: StockList;

  @BeforeUpdate()
  setDateAddIfDataUpdated() {
    this.date_add = new Date();
  }
}
