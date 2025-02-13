import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BehaviorLogPayload {
  guestId?: string;
  memberId?: number;
  productId?: number | null;
  eventType: string;
  eventTime: string;
  dwellTime: number | null;
  creationDate: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserBehaviorService {
  private baseUrl = 'https://localhost:7107/api/Log';

  // 用來存當前訪客/會員的ID
  private guestId: string = '';
  // 新增：用來存當前「會員」的 ID（若已登入）
  private memberId: number | null = null;

  constructor(private http: HttpClient) {
    // 在 service 的建構子，就先嘗試載入或生成 guestId
    let gid = localStorage.getItem('guestId');
    if (!gid) {
      gid = this.generateUUID();
      localStorage.setItem('guestId', gid);
    }
    this.guestId = gid;
    console.log('[UserBehaviorService] guestId =>', this.guestId);
  }
  public setMemberId(id: number | null): void {
    this.memberId = id;
  }
  // 統一的行為紀錄呼叫
  private logBehavior(payload: BehaviorLogPayload): Observable<any> {
    // 在這裡自動補上 memberId（若有）
    if (this.memberId) {
      payload.memberId = this.memberId;
    }

    // 也保證帶上 guestId
    if (!payload.guestId) {
      payload.guestId = this.guestId;
    }
    return this.http.post(`${this.baseUrl}/behavior`, payload);
  }

  // 查看商品 (VIEW_PRODUCT)
  logViewProduct(productId: number): Observable<any> {
    const payload: BehaviorLogPayload = {
      guestId: this.guestId, // 自動帶上
      productId: productId,
      eventType: 'VIEW_PRODUCT',
      eventTime: new Date().toISOString(),
      dwellTime: null,
      creationDate: null,
    };
    console.log('logViewProduct API 即將送出', payload);
    return this.logBehavior(payload);
  }

  // 搜尋 (SEARCH)
  logSearchKeyword(keyword: string): Observable<any> {
    const payload: BehaviorLogPayload = {
      guestId: this.guestId, // 自動帶上
      productId: null,
      eventType: 'SEARCH',
      eventTime: new Date().toISOString(),
      dwellTime: null,
      creationDate: null,
    };
    // 如果後端還要存關鍵字，可用 extraData 或另外擴充 payload
    console.log('logSearchKeyword API 即將送出', payload, 'keyword:', keyword);
    return this.logBehavior(payload);
  }

  // 產生 UUID
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
  logDwellTime(productId: number, dwellTime: number): Observable<any> {
    // 你可以把 eventType 命名為 'DWELL_TIME' 或 'VIEW_PRODUCT_END' 等等
    const payload = {
      guestId: this.guestId,
      memberId: this.memberId, // 如果已登入
      productId: productId,
      eventType: 'DWELL_TIME',
      eventTime: new Date().toISOString(),
      dwellTime: dwellTime, // <<< 這邊帶進去
    };
    return this.http.post(`${this.baseUrl}/behavior`, payload);
  }
}
