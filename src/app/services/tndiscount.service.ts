import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TNdiscount {
  discountId: number;
  discountName: string;
  productCategoryId: number | null;
  discountValue: number | null; // e.g. 0.2 (代表 8折) 或 0.1 (9折)
  startDate: string | null;
  endDate: string | null;
}

// 假設 ProductDiscountResult 是:
export interface ProductDiscountResult {
  productId: number;
  discountValue: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class TndiscountService {
  private apiUrl = 'https://localhost:7107/api/TNdiscounts';

  constructor(private http: HttpClient) {}
  /** 取得所有目前有效的折扣 */
  getAllDiscounts(): Observable<TNdiscount[]> {
    return this.http.get<TNdiscount[]>(`${this.apiUrl}`);
  }

  /** 針對某個商品分類ID，取得該分類是否有折扣 */
  getDiscountByCategory(categoryId: number): Observable<TNdiscount> {
    return this.http.get<TNdiscount>(`${this.apiUrl}/${categoryId}`);
  }

  // tndiscount.service.ts
  getDiscountsByProducts(
    productIds: number[]
  ): Observable<ProductDiscountResult[]> {
    return this.http.post<ProductDiscountResult[]>(
      `${this.apiUrl}/ByProducts`,
      productIds
    );
  }
}
