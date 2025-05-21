import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserOrderRequestDto {
    @ApiProperty({ required: false })
    @IsOptional()
    orderId?: number[];

    @ApiProperty({ required: false })
    @IsOptional()
    startDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    endDate?: string;
}