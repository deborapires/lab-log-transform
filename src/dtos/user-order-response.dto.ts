import { ApiProperty } from "@nestjs/swagger";
import { IOrders } from "src/interfaces/orders.interface";

export class UserOrderResponseDto {
    @ApiProperty()
    user_id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    orders: IOrders[];
}