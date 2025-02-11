export interface TNproductDTO {
  productId: number;
  productName: string;
  unitPrice: number;
  description: string;
  imageUrl: string;
  images: string[]; // 縮圖或其他額外圖片（可 0 張、多張）
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

export interface TopProductDTO {
  productId: number;
  productName: string;
  imageUrl: string;
  unitPrice: number;
  viewCount: number;
}

export interface ColorDTO {
  colorId: number;
  color: string;
  hasStock: boolean;
}

export interface SizeDTO {
  sizeId: number;
  size: string;
  hasStock: boolean;
}

export interface ThicknessDTO {
  thicknessId: number;
  thickness: string;
  hasStock: boolean;
}

export interface GenderDTO {
  genderId: number;
  gender: string;
  hasStock: boolean;
}
