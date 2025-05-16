import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as readline from 'readline';
import { ParsedLineResult, UserOrderImportResult } from 'src/interfaces/user-order-import';
import { UserOrderEntity } from '../entities/userOrderEntity';

@Injectable()
export class UserOrderService {
  private readonly logger = new Logger(UserOrderService.name);

  constructor(private dataSource: DataSource) {}

  async importFromTxt(filePath: string): Promise<UserOrderImportResult> {
    this.logger.log(`Starting import from file: ${filePath}`);

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
      this.logger.log('Reading file in chunks...');
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
      this.logger.log(`Import completed. Success: ${successCount}, Errors: ${errors.length}`);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error during import: ${err.message}`, err.stack);
    } finally {
      await queryRunner.release();
    }

    return {
      successCount,
      errors,
    };
  }

  private parseLine(line: string): ParsedLineResult | null {
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
      this.logger.warn(`Error parsing line: ${line}, returning null.`, error.stack);
      return null;
    }
  }

  private extractOrderIdFromLine(line: string): number | null {
    try {
      const orderIdStr = line.substring(45, 55).trim();
      const orderId = parseInt(orderIdStr, 10);
      return isNaN(orderId) ? null : orderId;
    } catch (error) {
      this.logger.warn(`Could not extract orderId from line: ${line}.`, error.stack);
      return null;
    }
  }
}
