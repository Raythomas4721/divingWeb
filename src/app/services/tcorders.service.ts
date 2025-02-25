import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TcordersService {
  
  private apiUrl = 'https://localhost:7107/api/TCorders'; // 根據實際設定調整

  constructor(private client: HttpClient) { }

  // 傳入訂單資料並發出 POST 請求，回傳訂單編號或訊息
  createOrder(orderData: any): Observable<string> {
    return this.client.post<string>(this.apiUrl, orderData);
  }

  getCourseById(id: number): Observable<any> {
    return this.client.get<any>(`${this.apiUrl}/${id}`);
  }

  getOrdersByMemberId(memberId: number): Observable<any[]> {
    const url = `${this.apiUrl}/member/${memberId}`; // 假設 API 路由為 /api/orders/member/{memberId}
    return this.client.get<any[]>(url);
  }
}
