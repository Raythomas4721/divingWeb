import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { UserDTO } from '../interface/userDTO';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private userService: UserService) {
    this.loadUserToken();
  }
  private userId = "";
  private userSubject = new ReplaySubject<UserDTO>(1);
  user$: Observable<UserDTO | null> = this.userSubject.asObservable(); // 讓元件可以監聽用戶資料變化

  private async loadUserToken() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userId = decodedToken.userId;
        await this.fetchUserProfile();
      } catch (error) {
        console.error("Token 錯誤", error);
      }
    }
  }
  private fetchUserProfile() {
    if (!this.userId) {
      return
    }
    this.userService.getUserProfile().subscribe({
      next: res => {
        console.log('用戶資料:', res);
        this.userSubject.next(res);
      },
      error: err => {
        console.log('獲取用戶失敗', err);
        this.userSubject.next(null!);
      }
    })
  }
}
