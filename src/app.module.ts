import { Module } from '@nestjs/common';
import { UserOrderController } from './controllers/user-order.controller';
import { UserOrderService } from './services/user-order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrderEntity } from './entities/userOrderEntity';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { UserOrderRepository } from './repositories/userOrderRepository';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'appuser',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'postgres',
      entities: [UserOrderEntity],
      synchronize: true, 
    }),
    TypeOrmModule.forFeature([UserOrderEntity]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UserOrderController],
  providers: [
    UserOrderService,
    {
      provide: 'UserOrderRepository',
      useFactory: (dataSource: DataSource) => new UserOrderRepository(dataSource),
      inject: [DataSource],
    },
  ],
})
export class AppModule {}