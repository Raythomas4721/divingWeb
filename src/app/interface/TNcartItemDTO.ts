// 假設購物車項目的型別
export interface TNcartItemDTO {
  cartitemId?: number;
  memberId: number | null; // 如果允許 null，就要看資料庫設定
  uproductId: number;
  productvariantsId?: number | null;
  productName: string;
  quantity: number;
  unitpriceatCart: number;
  isLocked: boolean | null;
  condition: string | null;
  creationDate: string | null; // 也可用 Date 型別，看你的需求
  updatedDate: string | null;
  imageUrl?: string | null;
}
