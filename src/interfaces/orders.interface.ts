import { IProducts } from "./products.interface";

export interface IOrders {
    orderId: number;
    total: string;
    date: string;
    products: IProducts;
}