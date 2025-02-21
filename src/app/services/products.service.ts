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
import { TUproductDTO, TUcreateproductDTO, TUcategory, TUcondition } from '../interface/TUproductDTO';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  public apiUrl = 'https://localhost:7107/'; // 修改為實際的 API 端點

  constructor(private http: HttpClient) { }

  getUsedProducts(page: number = 1, pageSize: number = 8, categoryId: number | null = null): Observable<any> {
    var queryString = `?page=${page}&pageSize=${pageSize}`;
    // if (keyword) {
    //   queryString += `&keyword=${keyword}`
    // }
    console.log(categoryId);
    if (categoryId) {
      queryString += `&categoryId=${categoryId}`
    }
    console.log('url:', queryString);
    return this.http.get<TUproductDTO[]>(`${this.apiUrl}api/TUproductsAPI${queryString}`);
    // let url = `${this.baseAddress}api/TUproductsAPI?page=${page}&pageSize=${pageSize}`;
  }
  getUsedCategory() {
    return this.http.get<TUcategory[]>(`${this.apiUrl}api/TUproductCategories`)
  }
  getUsedCondition() {
    return this.http.get<TUcondition[]>(`${this.apiUrl}api/TUproductCondition`)
  }
  /** 新增商品 */
  //  createUsedProduct(product: TUcreateproductDTO): Observable<any> {
  //   return this.http.post<any>(this.apiUrl, product, { withCredentials: true }).pipe(catchError(this.handleError));
  // }
  //  createProduct(product: createProduct): Observable<any> {
  //   return this.http.post<any>(this.baseUrl, product, { withCredentials: true }).pipe(catchError(this.handleError));
  // }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-product/${productId}`);
  }
}
