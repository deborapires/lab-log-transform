export interface UserOrderImportResult {
  successCount: number;
  errors: { orderId: number }[];
}

export interface ParsedLineResult {
  userId: number;
  name: string;
  orderId: number;
  productId: number;
  productValue: number;
  purchaseDate: number;
}