import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TncategoriesService {
  private baseUrl = 'https://localhost:7107/api/TNproductCategories';

  constructor(private http: HttpClient) {}
  getAllCategories(): Observable<any[]> {
    // return this.http.get<CategoryDTO[]>(this.baseUrl);
    return this.http.get<any[]>(this.baseUrl);
  }

  /**
   * 取得單一分類
   * GET /api/TNproductCategories/{id}
   */
  getCategory(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  /**
   * 取得該分類底下所有商品
   * GET /api/TNproductCategories/{id}/products
   */
  getProductsByCategory(id: number): Observable<any[]> {
    // return this.http.get<TNproductDTO[]>(`${this.baseUrl}/${id}/products`);
    return this.http.get<any[]>(`${this.baseUrl}/${id}/products`);
  }
}
