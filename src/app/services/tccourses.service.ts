import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TccoursesService {

  constructor(private client: HttpClient) { }

  getCourses(): Observable<any>{
    return this.client.get('https://localhost:7107/api/TCcourses');
  }
  getCourseById(id:number):Observable<any>{
    return this.client.get(`https://localhost:7107/api/TCcourses/${id}`)
  

  }


}
