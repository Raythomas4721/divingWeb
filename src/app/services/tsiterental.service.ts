import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TsiterentalService {

  siteDetails: any;
  // siteorder: any;

  constructor(private client: HttpClient) { }
  private apiUrl = "https://localhost:7107/api/TSsiteDetails"
  // private orderapiUrl = "https://localhost:7107/api/TSorder"
  private createOrderapiUrl = "https://localhost:7107/api/TSorder"

  getsiterental(region?: string, page: number = 1, pageSize: number = 2): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (region) {
      params = params.set('region', region);
    }

    return this.client.get(this.apiUrl, { params: params });
  }

  getsiterentalById(siteId: any): Observable<any> {
    return this.client.get(`${this.apiUrl}/${siteId}`);
  }

  createOrder(orderData: any): Observable<any> {
    return this.client.post(this.createOrderapiUrl, orderData);
  }

  // 改進 searchSites 方法，添加分頁參數
  searchSites(keyword: string, page: number = 1, pageSize: number = 2): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.client.get(`${this.apiUrl}/Search`, { params: params });
  }
}
