import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserDTO } from '../interface/userDTO';
import { UserBehaviorService } from './user-behavior.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private client: HttpClient,
    private userBehaviorService: UserBehaviorService
  ) {}
  private apiUrl = 'https://localhost:7107/api/TMmemberListsAPI';

  register(name: string, email: string, password: string) {
    const headers = {
      name: name,
      email: email,
      password: password,
    };
    return this.client.post(`${this.apiUrl}/register`, headers);
  }
  login(username: string, password: string): Observable<any> {
    const body = { email: username, password: password };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.client.post(`${this.apiUrl}/login`, body, httpOptions).pipe(
      tap((response: any) => {
        // 1) 假設後端回傳 { token, memberId, ... }
        const { token, memberId } = response;

        // 2) 將 token 存進 localStorage
        if (token) {
          localStorage.setItem('token', token);
        }

        // 3) 設定 userBehaviorService 的 memberId
        if (memberId) {
          this.userBehaviorService.setMemberId(memberId);
          console.log(this.userBehaviorService);
        }
      })
    );
  }
  getUserProfile(): Observable<UserDTO> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.client.get<UserDTO>(`${this.apiUrl}/profile`, { headers });
  }

  uploadProfilePhoto(formData: FormData): Observable<{ memberPhoto: string }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      Accept: 'application/json',
    });

    return this.client.patch<{ memberPhoto: string }>(
      `${this.apiUrl}/ChangeUserPhoto`,
      formData,
      { headers, reportProgress: true }
    );
  }
  logout() {
    // 清除 token
    localStorage.removeItem('token');

    // 清除 memberId
    this.userBehaviorService.setMemberId(null);
  }
}
