import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserOrderRequestDto {
    @ApiProperty()
    @IsOptional()
    orderId?:  number | number[];

    @ApiProperty()
    @IsOptional()
    startDate?: string;

    @ApiProperty()
    @IsOptional()
    endDate?: string;
}