export interface TUproductDTO {
  productId: number;
  sellerId: number;
  memberName: string;
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

export interface TUcreateproductDTO {
  productId: number;
  categoryId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productStatus: boolean;
  tUproductImages: string[];
}
