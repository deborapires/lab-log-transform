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
    const orderIdNumber = Array.isArray(filter.orderId)
      ? filter.orderId.map(id => parseInt(id as any, 10))
      : [parseInt(filter.orderId as any, 10)];
    whereConditions.orderId = In(orderIdNumber);
  }

  if (filter.startDate) {
    const startNumber = this.dateToNumber(filter.startDate);
    const endNumber = filter.endDate
      ? this.dateToNumber(filter.endDate)
      : startNumber;

    whereConditions.purchaseDate = Between(startNumber, endNumber);
  }

  const [items, total] = await this.findAndCount({
    where: Object.keys(whereConditions).length ? whereConditions : {},
    skip: (page - 1) * limit,
    take: limit,
  });


  return { items, total };
  }

  private dateToNumber(dateStr: string): number {
  const [year, month, day] = dateStr.split('-');
  return parseInt(`${year}${month}${day}`, 10);
}
}