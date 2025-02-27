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

  getsiterental(region?: string): Observable<any> {
    let params = new HttpParams();
    if (region) {
      params = params.set('region', region);
    }
    return this.client.get(this.apiUrl, { params: params });
  }

  getsiterentalById(siteId: any) {
    return this.client.get(`${this.apiUrl}/${siteId}`);
  }
  // getsiteorderById(siteId: any) {
  //   return this.client.get(`${this.orderapiUrl}/${siteId}`);
  // }
  createOrder(orderData: any): Observable<any> {
    return this.client.post(this.createOrderapiUrl, orderData);
  }

  // 新增的搜尋方法
  searchSites(keyword: string): Observable<any> {
    const params = new HttpParams().set('keyword', keyword);
    return this.client.get(`${this.apiUrl}/Search`, { params: params });
  }
}
