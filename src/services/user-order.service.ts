import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { IParsedLineResult, IUserOrderImportResult } from 'src/interfaces/user-order-import.interface';
import { UserOrderEntity } from '../entities/userOrderEntity';
import { UserOrderRequestDto } from 'src/dtos/user-order-request.dto';
import { UserOrderResponseDto } from 'src/dtos/user-order-response.dto';
import { UserOrderRepository } from 'src/repositories/userOrderRepository';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserOrderService {
  constructor(private dataSource: DataSource, private userOrderRepository: UserOrderRepository) {}

  async importFromTxt(filePath: string): Promise<IUserOrderImportResult> {
    console.log(`Starting import from file: ${filePath}`);

    const batchSize = 100;
    const batchEntities: Partial<UserOrderEntity>[] = [];

    const stream = fs.createReadStream(filePath, { encoding: 'utf-8', highWaterMark: 1024 * 64 });
    let leftover = '';

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let successCount = 0;
    const errors: number[] = [];

    try {
      console.log('Reading file in chunks...');
      for await (const chunk of stream) {
        leftover += chunk;
        const lines = leftover.split(/\r?\n/);
        leftover = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const parsed = this.parseLine(line);
          if (parsed) {
            batchEntities.push(parsed);
          } else {
            const orderId = this.extractOrderIdFromLine(line);
            if (orderId !== null) errors.push(orderId);
          }

          if (batchEntities.length >= batchSize) {
            await queryRunner.manager.insert(UserOrderEntity, batchEntities);
            successCount += batchEntities.length;
            batchEntities.length = 0;
          }
        }
      }

      if (leftover.trim()) {
        const parsed = this.parseLine(leftover);
        if (parsed) {
          batchEntities.push(parsed);
        } else {
          const orderId = this.extractOrderIdFromLine(leftover);
          if (orderId !== null) errors.push(orderId);
        }
      }

      if (batchEntities.length > 0) {
        await queryRunner.manager.insert(UserOrderEntity, batchEntities);
        successCount += batchEntities.length;
      }

      await queryRunner.commitTransaction();
      console.log(`Import completed. Success: ${successCount}, Errors: ${errors.length}`);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(`Error during import: ${err.message}`, err.stack);
    } finally {
      await queryRunner.release();
    }

    return {
      successCount,
      errors,
    };
  }

  async getUserOrder(params: UserOrderRequestDto): Promise<UserOrderResponseDto[]>{
    const userOrder = await this.userOrderRepository.listUserOrders(params);

    const userOrderItems = userOrder.items;

    const usersOrders: UserOrderResponseDto[] = plainToInstance(
      UserOrderResponseDto,
      userOrderItems,
      {
        excludeExtraneousValues: true,
      },
    );

    return usersOrders;

  }

  private parseLine(line: string): IParsedLineResult | null {
    const sizes = [10, 45, 10, 10, 12, 8];
    let pos = 0;
    const fields: string[] = [];

    try {
      for (const size of sizes) {
        const part = line.substring(pos, pos + size).trim();
        fields.push(part);
        pos += size;
      }

      const [userIdStr, name, orderIdStr, productIdStr, valueStr, dateStr] = fields;

      const userId = parseInt(userIdStr, 10);
      const orderId = parseInt(orderIdStr, 10);
      const productId = parseInt(productIdStr, 10);
      const productValue = parseFloat(valueStr);
      const purchaseDate = /^\d{8}$/.test(dateStr) ? parseInt(dateStr, 10) : 0;

      return { userId, name, orderId, productId, productValue, purchaseDate };
    } catch (error) {
      console.warn(`Error parsing line: ${line}, returning null.`, error.stack);
      return null;
    }
  }

  private extractOrderIdFromLine(line: string): number | null {
    try {
      const orderIdStr = line.substring(45, 55).trim();
      const orderId = parseInt(orderIdStr, 10);
      return isNaN(orderId) ? null : orderId;
    } catch (error) {
      console.warn(`Could not extract orderId from line: ${line}.`, error.stack);
      return null;
    }
  }
}
