export interface TNproductDTO {
  productId: number;
  productName: string;
  unitPrice: number;
  description: string;
}
export interface TNprovariantDTO {
  productvariantsId: number;
  productId: number;
  sizeId: number;
  colorId: number;
  thicknessId: number;
  genderId: number;
  stock: number;
}

export interface TNcategoryDTO {
  productCategoryId: number;
  categoryName: string;
  parentcategoryId: number;
  imageFileName: string;
}
