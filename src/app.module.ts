import { Module } from '@nestjs/common';
import { UserOrderController } from './controllers/user-order.controller';
import { UserOrderService } from './services/user-order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrderEntity } from './entities/userOrderEntity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrderEntity]),
  ],
  controllers: [UserOrderController],
  providers: [UserOrderService],
})
export class AppModule {}
