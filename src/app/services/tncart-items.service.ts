import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TNcartItemDTO } from '../interface/TNcartItemDTO';

@Injectable({
  providedIn: 'root',
})
export class TNcartItemsService {
  private baseUrl = 'https://localhost:7107/api/TNcartItems';
  private cartItemsSubject = new BehaviorSubject<TNcartItemDTO[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private client: HttpClient) {
    const stored = localStorage.getItem('cartItems');
    if (stored) {
      const parsed = JSON.parse(stored) as TNcartItemDTO[];
      this.cartItemsSubject.next(parsed);
    }
  }

  getCartItems(): TNcartItemDTO[] {
    return this.cartItemsSubject.value;
  }
  getAll(memberId: number): Observable<TNcartItemDTO[]> {
    return this.client
      .get<TNcartItemDTO[]>(`${this.baseUrl}?memberId=${memberId}`)
      .pipe(
        tap((items) => {
          // 更新 BehaviorSubject
          console.log('Service getAll() 拿回來的購物車資料:', items);
          this.cartItemsSubject.next(items);
        })
      );
  }

  // 2. 取得單一購物車項目
  getById(id: number): Observable<TNcartItemDTO> {
    return this.client.get<TNcartItemDTO>(`${this.baseUrl}/${id}`);
  }

  private updateLocalStorage(items: TNcartItemDTO[]): void {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }

  // 新增或更新購物車
  addToCart(newItem: TNcartItemDTO): void {
    const items = this.getCartItems();
    // 先檢查購物車裡面是否已存在相同 productvariantsId
    const existingItem = items.find(
      (item) =>
        item.productvariantsId === newItem.productvariantsId &&
        item.memberId === newItem.memberId
    );

    if (existingItem) {
      // 如果已存在，疊加數量
      existingItem.quantity += newItem.quantity;
      this.cartItemsSubject.next(items);
      // 同時呼叫後端 PUT /api/TNcartItems/{id}
      if (existingItem.cartitemId) {
        this.update(existingItem.cartitemId, existingItem).subscribe({
          next: (res) => console.log('後端更新成功:', res),
          error: (err) => console.error('後端更新失敗:', err),
        });
      }
    } else {
      // 否則新增
      this.create(newItem).subscribe({
        next: (createdItem) => {
          // 後端回傳最新的 cartitemId(若有)
          items.push(createdItem);
          this.cartItemsSubject.next(items);
          console.log('正在呼叫 create/update', newItem);
          this.updateLocalStorage(items);
        },
        error: (err) => console.error('後端新增失敗:', err),
      });
    }
  }

  // 其他操作 (移除、清空) 略...

  removeItem(variantId: number, memberId?: number): Observable<string> {
    // (1) 先呼叫後端
    let url = `${this.baseUrl}/byVariant/${variantId}`;
    if (memberId) url += `?memberId=${memberId}`;

    return this.client.delete<string>(url).pipe(
      tap((res) => {
        // 後端刪除成功後，再更新 BehaviorSubject
        const items = this.getCartItems();
        const idx = items.findIndex(
          (item) => item.productvariantsId === variantId
        );
        if (idx > -1) {
          items.splice(idx, 1);
          this.cartItemsSubject.next(items);
          this.updateLocalStorage(items);
        }
      })
    );
  }
  /**
   * 2) 套用優惠碼 (apply coupon)
   *   - 視後端API需求，可能要POST或GET, 這裡僅示範
   *   - 如果後端沒有API，就做本地的功能即可(例如打折)，視情況
   */
  applyCoupon(couponCode: string): Observable<any> {
    // 假設後端有一個 endpoint /apply-coupon 接收 POST { code: string }
    // 並回傳計算後的折扣/總價之類
    // 可將回傳結果再更新 BehaviorSubject
    const body = { code: couponCode };
    return this.client.post<any>(`${this.baseUrl}/apply-coupon`, body);
  }

  updateCart(): Observable<TNcartItemDTO[]> {
    // 從本地 BehaviorSubject 拿到最新 items
    const currentItems = this.getCartItems();
    // 呼叫後端PUT(或POST)，例如： PUT /api/TNcartItems/bulk
    return this.client.put<TNcartItemDTO[]>(
      `${this.baseUrl}/bulk`,
      currentItems
    );
  }

  setCartItems(items: TNcartItemDTO[]) {
    this.cartItemsSubject.next(items);
  }

  // 其它已存在的 CRUD方法
  // ==========================
  create(item: TNcartItemDTO): Observable<TNcartItemDTO> {
    return this.client.post<TNcartItemDTO>(this.baseUrl, item);
  }

  update(id: number, item: TNcartItemDTO): Observable<string> {
    return this.client.put<string>(`${this.baseUrl}/${id}`, item);
  }

  delete(id: number): Observable<string> {
    return this.client.delete<string>(`${this.baseUrl}/${id}`);
  }
  clearCart() {
    // 本地 BehaviorSubject 重置
    this.cartItemsSubject.next([]);
    // 2) 清空本地 localStorage
    this.updateLocalStorage([]);

    // 呼叫後端 e.g. DELETE /api/TNcartItems/clear?memberId=xxx
    // return this.client.delete<any>(
    //   `${this.baseUrl}/clear?memberId=${memberId}`
    // );
  }
}
