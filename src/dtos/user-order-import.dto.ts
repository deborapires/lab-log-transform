import { ApiProperty } from "@nestjs/swagger";

export class UserOrderImportDto {
    @ApiProperty()
    successCount: number;

    @ApiProperty()
    errors: number[];
}