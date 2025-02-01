import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7107/api/TMmemberListsAPI/login';
  constructor(private client: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const body = { "email": username, "password": password };
    return this.client.post(this.apiUrl, body);
  }

}
