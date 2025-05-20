export interface IUserOrderImportResult {
  successCount: number;
  errors: number[];
}
export interface IParsedLineResult {
  userId: number;
  name: string;
  orderId: number;
  productId: number;
  productValue: number;
  purchaseDate: number;
}