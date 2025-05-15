import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrderEntity } from '../entities/userOrderEntity';

@Injectable()
export class UserOrderRepository {
  constructor(
    @InjectRepository(UserOrderEntity, 'reader')
    private readonly readerRepository: Repository<UserOrderEntity>,

    @InjectRepository(UserOrderEntity, 'writer')
    private readonly writerRepository: Repository<UserOrderEntity>,
  ) {}

}