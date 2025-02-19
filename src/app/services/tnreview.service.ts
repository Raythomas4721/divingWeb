import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TNreviewDTO } from '../interface/TNreviewDTO';

@Injectable({
  providedIn: 'root',
})
export class TnreviewService {
  private baseUrl = 'https://localhost:7107/api/TNreviews';
  constructor(private http: HttpClient) {}
  addReview(review: TNreviewDTO): Observable<TNreviewDTO> {
    return this.http
      .post<TNreviewDTO>(this.baseUrl, review)
      .pipe(catchError(this.handleError));
  }
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // 網路錯誤 或 CORS、伺服器沒回應...
      console.error('An error occurred:', error.error);
    } else {
      // 後端回傳某個錯誤狀態碼
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    return throwError(() => new Error(error.error || 'Something bad happened'));
  }
}
