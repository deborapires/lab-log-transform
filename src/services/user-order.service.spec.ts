import { Test, TestingModule } from '@nestjs/testing';
import { UserOrderService } from '../services/user-order.service';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { UserOrderRequestDto } from '../dtos/user-order-request.dto';

const mockUserOrderRepository = () => ({
  listUserOrders: jest.fn(),
});

const mockDataSource = () => ({
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      insert: jest.fn(),
    },
  }),
});

describe('UserOrderService', () => {
  let service: UserOrderService;
  let userOrderRepository: any;
  let dataSource: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserOrderService,
        {
          provide: 'UserOrderRepository',
          useFactory: mockUserOrderRepository,
        },
        {
          provide: DataSource,
          useFactory: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<UserOrderService>(UserOrderService);
    userOrderRepository = module.get<any>('UserOrderRepository');
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when import from txt', () => {
    it('should import data from a valid TXT file', async () => {
      const filePath = './test/test.txt';
      const fileContent = '12345     Nome Sobrenome              67890     1234      123.45    20231026\n';

				jest.spyOn(fs, 'existsSync').mockReturnValue(true);

				const createReadStreamMock = jest.spyOn(fs, 'createReadStream');
				createReadStreamMock.mockImplementation(() => {
					const stream = require('stream');
					const readable = new stream.Readable();
					readable.push(fileContent);
					readable.push(null);
					return readable;
				});

				const queryRunnerMock = {
					connect: jest.fn(),
					startTransaction: jest.fn(),
					commitTransaction: jest.fn(),
					rollbackTransaction: jest.fn(),
					release: jest.fn(),
					manager: {
						insert: jest.fn(),
					},
				};

				jest.spyOn(dataSource, 'createQueryRunner').mockReturnValue(queryRunnerMock as any);

				const result = await service.importFromTxt(filePath);
				expect(result.successCount).toBeGreaterThan(0);
				expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
				expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  });

  describe('when get user order', () => {
    it('should return formatted user order data', async () => {
      const mockParams: UserOrderRequestDto = {};
      const mockUserOrderItems = [
        {
          userId: 1,
          name: 'Lara Mara',
          orderId: 101,
          purchaseDate: 20231026,
          productId: 201,
          productValue: 25.50,
        },
        {
          userId: 1,
          name: 'Lara Mara',
          orderId: 101,
          purchaseDate: 20231026,
          productId: 202,
          productValue: 30.00,
        },
      ];

      userOrderRepository.listUserOrders.mockResolvedValue({ items: mockUserOrderItems, total: mockUserOrderItems.length });

      const result = await service.getUserOrder(mockParams);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].user_id).toBe(1);
      expect(result[0].orders.length).toBe(1);
      expect(result[0].orders[0].total).toBe('55.50');
    });

    it('should handle no items returned from repository', async () => {
      userOrderRepository.listUserOrders.mockResolvedValue({ items: [], total: 0 });
      const result = await service.getUserOrder({});
      expect(result).toEqual([]);
    });
  });

  describe('when parse line', () => {
    it('should parse a valid line', () => {
      const line = '12345     Nome Sobrenome                               67890     1234            123.4520231026';
      const result = service['parseLine'](line);
      expect(result).toEqual({
        userId: 12345,
        name: 'Nome Sobrenome',
        orderId: 67890,
        productId: 1234,
        productValue: 123.45,
        purchaseDate: 20231026,
      });
    });

    it('should return null for an invalid line', () => {
      const line = '                                                                                                   ';
      const result = service['parseLine'](line);
      expect(result).toBeNull();
    });
  });

  describe('when extract order id from line', () => {
    it('should extract orderId from a valid line', () => {
      const line = '12345     Nome Sobrenome                     67890     1234      123.45    20231026';
      const result = service['extractOrderIdFromLine'](line);
      expect(result).toBe(67890);
    });

    it('should return null if orderId cannot be extracted', () => {
      const line = '12345     Nome Sobrenome                     abcde     1234       123.45    20231026';
      const result = service['extractOrderIdFromLine'](line);
      expect(result).toBeNull();
    });
  });
});
