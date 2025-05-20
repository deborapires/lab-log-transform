import { ApiProperty } from "@nestjs/swagger";
import { IOrders } from "src/interfaces/orders.interface";

export class UserOrderResponseDto {
    @ApiProperty()
    userId: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    orders: IOrders[];
}