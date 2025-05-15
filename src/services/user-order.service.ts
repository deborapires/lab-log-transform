import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrderEntity } from '../entities/userOrderEntity';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as readline from 'readline';
import { ParsedLineResult, UserOrderImportResult } from 'src/interfaces/user-order-import';

@Injectable()
export class UserOrderService {
  constructor(
    @InjectRepository(UserOrderEntity)
    private readonly repository: Repository<UserOrderEntity>,
    private dataSource: DataSource
  ) {}

  async importFromTxt(filePath: string): Promise<UserOrderImportResult> {
    const fileStream = fs.createReadStream(filePath, 'utf-8');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let successCount = 0;
    const errors: { orderId: number }[] = [];
    let parsed: any;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for await (const line of rl) {
        if (!line.trim()) continue;

        parsed = this.parseLine(line);

        if (!parsed) {
          console.warn(`Error parsing line: ${line}. Skipping line.`);
          continue;
        }

        const entity = this.repository.create(parsed);
        await queryRunner.manager.save(entity);
        successCount++;
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`Error when importing: ${error.message}`);
    } finally {
      await queryRunner.release();
    }

    return {
      successCount: successCount,
      errors: errors,
    };
  }

  private parseLine(line: string): ParsedLineResult {
    const sizes = [10, 45, 10, 10, 12, 8];
    let pos = 0;

    const fields = sizes.reduce<string[]>((acc, size) => {
      const part = line.substring(pos, pos + size).trim();
      acc.push(part);
      pos += size;
      return acc;
    }, []);

    const [userIdStr, name, orderIdStr, productIdStr, valueStr, dateStr] = fields;

    const userId = parseInt(userIdStr, 10);
    const orderId = parseInt(orderIdStr, 10);
    const productId = parseInt(productIdStr, 10);
    const productValue = parseFloat(valueStr);

    const purchaseDate = /^\d{8}$/.test(dateStr) ? parseInt(dateStr, 10) : 0;

    return { userId, name, orderId, productId, productValue, purchaseDate };
  }
}