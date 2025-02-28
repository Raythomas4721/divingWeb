
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TUproductDTO, TUcreateproductDTO, TUcategory, TUcondition, TUproductDetail } from '../interface/TUproductDTO';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  public apiUrl = 'https://localhost:7107/'; // 修改為實際的 API 端點

  constructor(private http: HttpClient) { }

  getUsedProducts(
    page: number = 1,
    pageSize: number = 8,
    categoryId: number | null = null,
    keyword: string = '',
    sortOption: string = ''
  ): Observable<any> {
    var queryString = `?page=${page}&pageSize=${pageSize}`;

    if (categoryId) {
      queryString += `&categoryId=${categoryId}`
    }

    if (keyword.trim() !== '') {
      queryString += `&keyword=${encodeURIComponent(keyword)}`;
    }
    if (sortOption.trim() !== '') {
      queryString += `&sort=${sortOption}`;
    }
    console.log('test', queryString);
    return this.http.get<TUproductDTO[]>(`${this.apiUrl}api/TUproductsAPI${queryString}`);

  }
  getUsedCategory() {
    return this.http.get<TUcategory[]>(`${this.apiUrl}api/TUproductCategories`)
  }
  getUsedCondition() {
    return this.http.get<TUcondition[]>(`${this.apiUrl}api/TUproductCondition`)
  }

  createUsedProduct(product: TUcreateproductDTO): Observable<any> {
    return this.http.post<TUproductDTO>(`${this.apiUrl}api/TUproductsAPI`, product);
  }
  //抓edit資料
  getProductById(productId: number): Observable<TUproductDetail> {
    return this.http.get<TUproductDetail>(`${this.apiUrl}api/TUproductsAPI/${productId}`)
  }
  //更新商品
  updateProduct(product: TUcreateproductDTO): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}api/TUproductsAPI/${product.productId}`, product);
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<TUproductDTO[]>(`${this.apiUrl}api/TUproductsAPI/${productId}`);
  }
}
