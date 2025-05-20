import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { UserOrderEntity } from '../entities/userOrderEntity';
import { UserOrderRequestDto } from 'src/dtos/user-order-request.dto';

@Injectable()
export class UserOrderRepository {
  constructor(
    @InjectRepository(UserOrderEntity, 'reader')
    private readonly readerRepository: Repository<UserOrderEntity>,
  ) {}

async listUserOrders(
  filter: UserOrderRequestDto,
): Promise<{
total: number;
items: UserOrderEntity[]; 
}> {
  const page =  1; //can be passed by parameter 
  const limit =  100; //can be passed by parameter 
  const whereConditions: any = {};

    if (filter.orderId !== undefined && filter.orderId !== null) {
    whereConditions.id = Array.isArray(filter.orderId)
      ? In(filter.orderId)
      : filter.orderId;
  }

  if (filter.startDate) {
    const start = new Date(filter.startDate);
    const end = filter.endDate
      ? new Date(`${filter.endDate}T23:59:59.999Z`)
      : (() => {
          const d = new Date(start);
          d.setHours(23, 59, 59, 999);
          return d;
        })();

    whereConditions.createdAt = Between(start, end);
  }

  const [items, total] = await this.readerRepository.findAndCount({
    where: Object.keys(whereConditions).length ? whereConditions : null,
    skip: (page - 1) * limit,
    take: limit,
  });


  return { items, total };
  }
}