import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserOrderEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ length: 45 })
  name: string;

  @Column()
  orderId: number;

  @Column()
  productId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  productValue: number;

  @Column()
  purchaseDate: number;
}
