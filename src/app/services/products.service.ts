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

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  public apiUrl = 'https://localhost:7107/TUproductsAPI'; // 修改為實際的 API 端點

  constructor(private http: HttpClient) {}

  getUsedProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/used-products`);
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-product/${productId}`);
  }
}
