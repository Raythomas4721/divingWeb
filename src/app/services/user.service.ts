import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserDTO } from '../interface/userDTO';
import { UserBehaviorService } from './user-behavior.service';
import { TNcartItemsService } from './tncart-items.service';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private client: HttpClient,
    private userBehaviorService: UserBehaviorService,
    private cartItemsService: TNcartItemsService
  ) { }
  private apiUrl = 'https://localhost:7107/api';

  // 要求驗證碼
  requestVerificationCode(email: string): Observable<any> {
    return this.client.post(`${this.apiUrl}/account/send-verification-code`, { email });
  }

  // 驗證驗證碼並完成註冊
  verifyAndRegister(name: string, email: string, password: string, verificationCode: string): Observable<any> {
    return this.client.post(`${this.apiUrl}/account/register-with-verification`, {
      name,
      email,
      password,
      verificationCode,
    });
  }

  register(name: string, email: string, password: string) {
    const headers = {
      name: name,
      email: email,
      password: password,
    };
    return this.client.post(`${this.apiUrl}/TMmemberListsAPI/register`, headers);
  }
  login(username: string, password: string): Observable<any> {
    const body = { email: username, password: password };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.client.post(`${this.apiUrl}/TMmemberListsAPI/login`, body, httpOptions).pipe(
      tap((response: any) => {
        const { token, memberId } = response;

        if (token) {
          localStorage.setItem('token', token);
        }

        // 3) 設定 userBehaviorService 的 memberId
        if (memberId) {
          this.userBehaviorService.setMemberId(memberId);
          console.log(this.userBehaviorService);
          // 在這裡「另外訂閱」購物車API, 不會阻塞本次 login 的回傳
          this.cartItemsService.getAll(memberId).subscribe({
            next: (items) => {
              this.cartItemsService.setCartItems(items);
              console.log('抓取後端購物車成功:', items);
            },
            error: (err) => {
              console.error('抓取購物車失敗', err);
            },
          });
        }
      })
    );
  }
  getUserProfile(): Observable<UserDTO> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.client.get<UserDTO>(`${this.apiUrl}/TMmemberListsAPI/profile`, { headers });
  }

  uploadProfilePhoto(formData: FormData): Observable<{ memberPhoto: string }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    return this.client.put<{ memberPhoto: string }>(
      `${this.apiUrl}/TMmemberListsAPI/ChangeUserPhoto`,
      formData,
      { headers, reportProgress: true }
    );
  }

  updateUserProfile(updatedProfile: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
    return this.client.put(`${this.apiUrl}/TMmemberListsAPI/UpdateUserInfo`, updatedProfile, {
      headers,
    });
  }

  changePassword(changePasswordData: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
    return this.client.put(
      `${this.apiUrl}/TMmemberListsAPI/changePassword`,
      changePasswordData,
      { headers }
    );
  }
  resetPassword(token: string, newPassword: string): Observable<any> {
    const body = { token, newPassword };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    return this.client.post(`${this.apiUrl}/TMmemberListsAPI/reset-password`, body, httpOptions).pipe(
      tap((response: any) => {
        if (response.status) {
          console.log('密碼重置成功:', response.message);
        }
      })
    );
  }
}
