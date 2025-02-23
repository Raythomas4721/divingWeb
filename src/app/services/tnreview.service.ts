// tnreview.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TNreviewDTO } from '../interface/TNreviewDTO';

@Injectable({
  providedIn: 'root',
})
export class TnreviewService {
  private baseUrl = 'https://localhost:7107/api/TNreviews';

  constructor(private http: HttpClient) {}

  /** 取得指定商品的全部評論 */
  getAllReviewsByProduct(productId: number): Observable<TNreviewDTO[]> {
    return this.http
      .get<TNreviewDTO[]>(`${this.baseUrl}/product/${productId}`)
      .pipe(catchError(this.handleError));
  }

  /** 回傳 { avgRating: number; reviewCount: number } 幫你算好平均分數 & 總評論數 */
  getReviewStatsByProduct(
    productId: number
  ): Observable<{ avgRating: number; reviewCount: number }> {
    return this.getAllReviewsByProduct(productId).pipe(
      map((reviews) => {
        if (!reviews || reviews.length === 0) {
          return { avgRating: 0, reviewCount: 0 };
        }
        const total = reviews.reduce((sum, r) => sum + r.reviewRating, 0);
        const avgRating = total / reviews.length;
        return { avgRating, reviewCount: reviews.length };
      }),
      catchError(this.handleError)
    );
  }

  /** 新增評論 */
  addReview(review: TNreviewDTO): Observable<TNreviewDTO> {
    return this.http
      .post<TNreviewDTO>(this.baseUrl, review)
      .pipe(catchError(this.handleError));
  }

  // 你已有的 handleError、updateReview、deleteReview...等方法
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}:`, error.error);
    }
    return throwError(() => new Error(error.error || 'Something bad happened'));
  }
}
