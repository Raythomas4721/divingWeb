export interface TUproductDTO {
  productId: number;
  sellerName: string;
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
export interface TUproductDetail {
  productId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  updatedAt: string | null;
  createdAt: string;
  productStatus: boolean;
}
export interface TUcreateproductDTO {
  // productId: number;
  sellerId: number;
  categoryId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productStatus: boolean;
  productConditionId: number;
  tUproductImages: string[];
}
export interface TUcategory {
  categoryId: number;
  categoryName: string;
}
export interface TUcondition {
  productConditionId: number;
  condition: string;
}

