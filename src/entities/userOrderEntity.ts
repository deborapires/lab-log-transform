import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserOrderEntity {
  @PrimaryGeneratedColumn()
  id:string;

  @Column('uuid', { name: 'user_id' })
  userId: number;

  @Column('varchar',{ length: 45, name: 'name' })
  name: string;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'product_value' })
  productValue: number;

  @Column({ name: 'purchase_date' })
  purchaseDate: number;
}
