import { IProducts } from "./products.interface";

export interface IOrders {
    orderId: number;
    total: number;
    date: string;
    products: IProducts;
}