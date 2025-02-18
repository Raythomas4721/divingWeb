import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // 這將把服務注入到整個應用程式
})
export class CourseService {

  private apiUrl = 'https://localhost:7107/api/courses'; // 課程 API 的基礎 URL


  constructor(private http: HttpClient) {}

  // 新增課程
  addCourse(courseData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, courseData);
  }

  // 根據課程 ID 獲取課程資料
  getCourseById(courseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${courseId}`);
  }

  // 更新課程資料
  updateCourse(courseId: number, courseData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${courseId}`, courseData);
  }

  // 可以添加更多方法來處理課程的刪除或其他功能
}
