import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { UserDTO } from '../interface/userDTO';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private userService: UserService) {
    this.loadUserToken();
  }

  private userId = '';
  private userName = '';
  private userSubject = new ReplaySubject<UserDTO>(1);
  user$: Observable<UserDTO | null> = this.userSubject.asObservable();

  private async loadUserToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userId = decodedToken.userId;
        this.userName = decodedToken.name;
        this.updateUserProfile();
      } catch (error) {
        console.error('Token 錯誤', error);
      }
    }
  }

  // 將 fetchUserProfile 改為 updateUserProfile，避免兩者重複
  updateUserProfile() {
    if (!this.userId) {
      console.warn('未取得 userId');
      return;
    }

    // 獲取用戶資料並更新
    this.userService.getUserProfile().subscribe({
      next: (res) => {
        console.log('用戶資料已更新:', res);
        this.userSubject.next(res);
      },
      error: (err) => {
        console.error('更新後獲取用戶失敗', err);
        this.userSubject.next(null!);
      },
    });
  }

  clearUserProfile() {
    this.userSubject.next(null!);
  }
}
