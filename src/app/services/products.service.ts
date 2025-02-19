// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProductsService {

//   constructor() { }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TUproductDTO } from '../interface/TUproductDTO';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  public apiUrl = 'https://localhost:7107/'; // 修改為實際的 API 端點

  constructor(private http: HttpClient) { }

  getUsedProducts(page: number = 1, pageSize: number = 8, keyword?: string, categoryId: number | null = null,): Observable<any> {
    return this.http.get<TUproductDTO[]>(`${this.apiUrl}api/TUproductsAPI?page=${page}&pageSize=${pageSize}`);
    // let url = `${this.baseAddress}api/TUproductsAPI?page=${page}&pageSize=${pageSize}`;

  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-product/${productId}`);
  }
}
