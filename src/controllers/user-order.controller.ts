import { Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserOrderService } from '../services/user-order.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UserOrderImportDto } from 'src/dtos/user-order-import.dto';

@ApiTags('userOrder')
@Controller({
  path: 'user-orders',
  version: '1',
})
export class UserOrderController {
  constructor(private readonly userOrderService: UserOrderService) {}

  @ApiResponse({
    status: 200,
    description: 'Return of the import with the total number of successful records and the ids of the orders with import errors.',
    type: UserOrderImportDto,
  })
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo para importação',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const filename = path.parse(file.originalname).name.replace(/\s/g, '') + Date.now();
          const extension = path.parse(file.originalname).ext;
          callback(null, `${filename}${extension}`)
        }
      })
    }))
  async importUserOrders(
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
      ],
    })) file: Express.Multer.File,
  ): Promise<UserOrderImportDto> {
      console.log('Processing file upload...');
      const result = await this.userOrderService.importFromTxt(file.path);
      console.log('File processing completed.');
      return result;
  }
}
