import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TNcartItemDTO } from '../interface/TNcartItemDTO';

@Injectable({
  providedIn: 'root',
})
export class TNcartItemsService {
  private baseUrl = 'https://localhost:7107/api/TNcartItems';
  constructor(private client: HttpClient) {}
  getAll(): Observable<TNcartItemDTO[]> {
    return this.client.get<TNcartItemDTO[]>(this.baseUrl);
  }

  // 2. 取得單一購物車項目
  getById(id: number): Observable<TNcartItemDTO> {
    return this.client.get<TNcartItemDTO>(`${this.baseUrl}/${id}`);
  }

  // 3. 新增購物車項目 (POST)
  create(item: TNcartItemDTO): Observable<TNcartItemDTO> {
    // 依你的後端 POST 設計，需要送出 TNcartItemDTO
    return this.client.post<TNcartItemDTO>(this.baseUrl, item);
  }

  // 4. 更新購物車項目 (PUT)
  update(id: number, item: TNcartItemDTO): Observable<string> {
    // 你的 API 回傳的是 string ("修改購物車成功" 或 "失敗")
    return this.client.put<string>(`${this.baseUrl}/${id}`, item);
  }

  // 5. 刪除購物車項目 (DELETE)
  delete(id: number): Observable<string> {
    // 同理，回傳 string
    return this.client.delete<string>(`${this.baseUrl}/${id}`);
  }
}
