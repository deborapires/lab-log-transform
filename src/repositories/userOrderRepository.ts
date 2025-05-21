import { Between, In, Repository, DataSource} from 'typeorm';
import { UserOrderEntity } from '../entities/userOrderEntity';
import { UserOrderRequestDto } from 'src/dtos/user-order-request.dto';
import { InjectDataSource } from '@nestjs/typeorm';

export class UserOrderRepository extends Repository<UserOrderEntity> {
  constructor(
    @InjectDataSource('writer')
    dataSource: DataSource,
  ) {
    super(UserOrderEntity, dataSource.createEntityManager());
  }

async listUserOrders(
  filter: UserOrderRequestDto,
): Promise<{
total: number;
items: UserOrderEntity[]; 
}> {
  const page =  1; //can be passed by parameter 
  const limit =  100; //can be passed by parameter 
  const whereConditions: any = {};

  if (filter.orderId) {
    whereConditions.orderId = In(filter.orderId);
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

  const [items, total] = await this.findAndCount({
    where: Object.keys(whereConditions).length ? whereConditions : null,
    skip: (page - 1) * limit,
    take: limit,
  });


  return { items, total };
  }
}