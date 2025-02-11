import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  TNproductDTO,
  TNprovariantDTO,
  TopProductDTO,
  ColorDTO,
  SizeDTO,
  ThicknessDTO,
  GenderDTO,
} from '../interface/TNproductDTO';

@Injectable({
  providedIn: 'root',
})
export class TnproductService {
  private baseUrl = 'https://localhost:7107/api/TNproducts';
  private variantsUrl = 'https://localhost:7107/api/TNproductvariants';
  constructor(private http: HttpClient) {}

  getTopProducts(take: number = 5): Observable<TopProductDTO[]> {
    // GET /api/products/top?take=5
    return this.http.get<TopProductDTO[]>(`${this.baseUrl}/top?take=${take}`);
  }

  getAllProducts(keyword?: string): Observable<TNproductDTO[]> {
    let url = this.baseUrl;
    if (keyword) {
      url += `?search=${encodeURIComponent(keyword)}`;
    }
    return this.http.get<TNproductDTO[]>(url);
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
  getColorsForProduct(productId: number): Observable<ColorDTO[]> {
    const url = `${this.variantsUrl}/colors?productId=${productId}`;
    return this.http.get<ColorDTO[]>(url);
  }
  getSizesForProduct(productId: number): Observable<SizeDTO[]> {
    const url = `${this.variantsUrl}/sizes?productId=${productId}`;
    return this.http.get<SizeDTO[]>(url);
  }

  getThicknessForProduct(productId: number): Observable<ThicknessDTO[]> {
    const url = `${this.variantsUrl}/thickness?productId=${productId}`;
    return this.http.get<ThicknessDTO[]>(url);
  }

  getGenderForProduct(productId: number): Observable<GenderDTO[]> {
    const url = `${this.variantsUrl}/gender?productId=${productId}`;
    return this.http.get<GenderDTO[]>(url);
  }
}
