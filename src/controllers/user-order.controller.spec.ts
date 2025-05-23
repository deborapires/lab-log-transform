import { Test, TestingModule } from '@nestjs/testing';
import { UserOrderController } from '../controllers/user-order.controller';
import { UserOrderService } from '../services/user-order.service';
import { UserOrderImportDto } from '../dtos/user-order-import.dto';
import { UserOrderResponseDto } from '../dtos/user-order-response.dto';
import { UserOrderRequestDto } from '../dtos/user-order-request.dto';
import { Readable } from 'stream';

describe('UserOrderController', () => {
    let userOrderController: UserOrderController;
    let userOrderService: {
        importFromTxt: jest.Mock;
        getUserOrder: jest.Mock;
    };

    const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        stream: new Readable(),
        destination: 'uploads/',
        filename: 'test.txt',
        path: 'uploads/test.txt',
        buffer: Buffer.from('test data'),
    };

    beforeEach(async () => {
        userOrderService = {
            importFromTxt: jest.fn(),
            getUserOrder: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserOrderController],
            providers: [
                {
                    provide: UserOrderService,
                    useValue: userOrderService,
                },
            ],
        }).compile();

        userOrderController = module.get<UserOrderController>(UserOrderController);
    });

    it('should be defined', () => {
        expect(userOrderController).toBeDefined();
    });

    describe('when import user orders', () => {
        it('should call userOrderService.importFromTxt with the correct file path', async () => {
            const mockImportResult: UserOrderImportDto = { successCount: 10, errors: [] };
            userOrderService.importFromTxt.mockResolvedValue(mockImportResult);

            await userOrderController.importUserOrders(mockFile);

            expect(userOrderService.importFromTxt).toHaveBeenCalledWith(mockFile.path);
        });

        it('should return the result from userOrderService.importFromTxt', async () => {
            const mockImportResult: UserOrderImportDto = { successCount: 5, errors: [1] };
            userOrderService.importFromTxt.mockResolvedValue(mockImportResult);

            const result = await userOrderController.importUserOrders(mockFile);

            expect(result).toEqual(mockImportResult);
        });

        it('should handle errors from userOrderService and throw Error', async () => {
            userOrderService.importFromTxt.mockRejectedValue(new Error('Service error'));

            await expect(userOrderController.importUserOrders(mockFile)).rejects.toThrow(Error);
        });
    });

    describe('when list user orders', () => {
        it('should call userOrderService.getUserOrder with the provided filter', async () => {
            const mockFilter: UserOrderRequestDto = { orderId: [1, 2, 3], startDate: '2024-01-01', endDate: '2024-01-31' };
            const mockResponse: UserOrderResponseDto[] = [];
            userOrderService.getUserOrder.mockResolvedValue(mockResponse);

            await userOrderController.listUserOrders(mockFilter);

            expect(userOrderService.getUserOrder).toHaveBeenCalledWith(mockFilter);
        });

        it('should return the result from userOrderService.getUserOrder', async () => {
            const mockFilter: UserOrderRequestDto = { orderId: [4, 5], startDate: '2024-02-01', endDate: '2024-02-29' };
            const mockResponse: UserOrderResponseDto[] = [{ user_id: 787889 , name: 'Natália Rodrigues', orders: [] }];
            userOrderService.getUserOrder.mockResolvedValue(mockResponse);

            const result = await userOrderController.listUserOrders(mockFilter);

            expect(result).toEqual(mockResponse);
        });

        it('should handle errors from userOrderService and throw InternalServerErrorException', async () => {
            const mockFilter: UserOrderRequestDto = { orderId: [6], startDate: '2024-03-01', endDate: '2024-03-31' };
            userOrderService.getUserOrder.mockRejectedValue(new Error('Service error'));

            await expect(userOrderController.listUserOrders(mockFilter)).rejects.toThrow(Error);
        });
    });
});
