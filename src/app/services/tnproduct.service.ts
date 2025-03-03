import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  TNproductDTO,
  TNprovariantDTO,
  TopProductDTO,
  ColorDTO,
  SizeDTO,
  ThicknessDTO,
  GenderDTO,
} from '../interface/TNproductDTO';
import { PagedResult } from '../interface/TNproductDTO';

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

  getAllProductsPaged(
    page: number,
    size: number,
    search?: string,
    order?: string
  ): Observable<PagedResult<TNproductDTO>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (search) {
      params = params.set('search', search);
    }
    if (order) {
      params = params.set('order', order);
    }

    // 假設後端路由還是 https://localhost:7107/api/TNproducts
    return this.http.get<PagedResult<TNproductDTO>>(this.baseUrl, { params });
  }

  getAllProducts(
    keyword?: string,
    order?: string
  ): Observable<PagedResult<TNproductDTO>> {
    let params = new HttpParams();
    if (keyword) {
      params = params.set('search', keyword);
    }
    if (order) {
      params = params.set('order', order);
    }
    // 後端真實回傳 { items: [...], totalCount: ... }
    return this.http.get<PagedResult<TNproductDTO>>(this.baseUrl, { params });
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
