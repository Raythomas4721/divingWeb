export interface TUproductDTO {
  productId: number;
  sellerId: number;
  categoryId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  updatedAt: string | null;
  createdAt: string;
  productConditionId: number;
  productStatus: boolean;
  tUproductImages: string;
}
