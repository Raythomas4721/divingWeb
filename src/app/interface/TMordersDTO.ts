export interface TMordersDTO {
  orderType: string;
  orderId: number;
  orderStatus?: string | null;
  shipAddress?: string | null;
  shipPhone?: string | null;
  paymentMethod?: string | null;
  orderStatusId?: number | null;
  orderLogId?: number | null;
  orderDate?: string | null;
  siteId?: number | null;
}
