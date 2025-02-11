import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TNproductDTO, TNprovariantDTO } from '../interface/TNproductDTO';

@Injectable({
  providedIn: 'root',
})
export class TnproductService {
  private baseUrl = 'https://localhost:7107/api/TNproducts';
  private variantsUrl = 'https://localhost:7107/api/TNproductvariants';
  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<TNproductDTO[]> {
    return this.http.get<TNproductDTO[]>(this.baseUrl);
  }
  // 這是你需要的 getSingleProduct()，根據 productId 取得單一商品
  getSingleProduct(productId: number): Observable<TNproductDTO> {
    const url = `https://localhost:7107/api/TNproducts/${productId}`;
    return this.http.get<TNproductDTO>(url);
  }

  // getProductVariants(productId: number): Observable<TNprovariantDTO[]> {
  //   return this.http.get<TNprovariantDTO[]>(
  //     'https://localhost:7107/api/TNproductvariants'
  //   );

  // }
  getProductVariants(productId: number): Observable<TNprovariantDTO[]> {
    return this.http.get<TNprovariantDTO[]>(
      `${this.variantsUrl}?productId=${productId}`
    );
  }
}
