import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TcordersService {
  
  private apiUrl = 'https://localhost:7107/api/TCorders'; // 根據實際設定調整

  // 使用 BehaviorSubject 來儲存訂單數據
  private orderSubject = new BehaviorSubject<any>(null);
  orderData$ = this.orderSubject.asObservable();

  constructor(private client: HttpClient) {
    this.loadOrderDataFromSession(); // 初始化時嘗試從 sessionStorage 還原
  }

  // 改訂單狀態
  editOrderStatus(orderId: number, orderData: any): Observable<string> {
    return this.client.put<string>(`${this.apiUrl}/${orderId}`, orderData);
  } 

  //取得用戶(memberId)資料庫訂單表最新一筆訂單
  getLatestOrderById(memberId: number){
    return this.client.get<any>(`${this.apiUrl}/memberLatestOrder/${memberId}`);
  }


  // 設定訂單數據並存入 sessionStorage
  setOrderData(data: any) {
    this.orderSubject.next(data);
    sessionStorage.setItem('orderData', JSON.stringify(data));
  }

  // 嘗試從 sessionStorage 加載數據
  loadOrderDataFromSession() {
    const storedData = sessionStorage.getItem('orderData');
    if (storedData) {
      this.orderSubject.next(JSON.parse(storedData));
    }
  }

  // 取得當前的 orderData
  getOrderData() {
    return this.orderSubject.value;
  }

  // 發送訂單請求
  createOrder(orderData: any): Observable<any> {
    return this.client.post(`${this.apiUrl}`, orderData).pipe(
      catchError(error => {
        console.error('訂單 API 錯誤:', error);
        return throwError(() => new Error(error));
      })
    );
  }

  // 根據課程 ID 獲取課程資訊
  getCourseById(id: number): Observable<any> {
    return this.client.get<any>(`${this.apiUrl}/${id}`);
  }

  // 根據會員 ID 獲取訂單
  getOrdersByMemberId(memberId: number): Observable<any[]> {
    const url = `${this.apiUrl}/member/${memberId}`; // 假設 API 路由為 /api/orders/member/{memberId}
    return this.client.get<any[]>(url);
  }

}
