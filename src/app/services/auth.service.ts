import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { UserDTO } from '../interface/userDTO';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, map, Observable, of, ReplaySubject, tap } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private userService: UserService, private alertService: AlertService) {
    this.loadUserToken();
  }

  private userId = '';
  private userName = '';
  private userSubject = new ReplaySubject<UserDTO>(1);

  user$: Observable<UserDTO | null> = this.userSubject.asObservable(); // 讓元件可以監聽用戶資料變化
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  setUserId(userId: string) {
    this.userId = userId;
  }
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  private async loadUserToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.isLoggedInSubject.next(true);
        this.userId = decodedToken.sub || decodedToken.userId || '';
        this.userName = decodedToken.name || 'Google 用戶';
        await this.fetchUserProfile();
      } catch (error) {
        console.error('Token 錯誤', error);
        this.isLoggedInSubject.next(false);
      }
    }
  }
  private fetchUserProfile() {
    if (!this.userId) {
      console.warn('fetchUserProfile: 未取得 userId');
      return
    }
    this.userService.getUserProfile().subscribe({
      next: res => {
        // console.log('用戶資料:', res);
        // this.userSubject.next(res);
        this.userSubject.next(res.user || res);
        this.isLoggedInSubject.next(true);
      },
      error: err => {
        console.log('獲取用戶失敗', err);
        this.userSubject.next(null!);
        this.isLoggedInSubject.next(false);
      }
    })
  }
  updateUserProfile(): Observable<any> {
    if (!this.userId) {
      console.warn("未取得 userId");
      return of(null);
    }
    return this.userService.getUserProfile().pipe(
      tap({
        next: (res) => {
          // console.log('用戶資料:', res.user);
          this.userSubject.next(res.user);
          this.isLoggedInSubject.next(true);
        },
        error: (err) => {
          console.log('獲取用戶失敗', err);
          this.userSubject.next(null!);
          this.isLoggedInSubject.next(false);
        },
      }),
      map(res => res.user)
    );
  }

  clearUserProfile() {
    this.userSubject.next(null!);
    this.isLoggedInSubject.next(false);
  }
}
