import { UserService } from './../../services/user.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private UserService: UserService) { }

  ngOnInit(): void {
    this.UserService.getUserInfo().subscribe({
      next: (data) => {
        console.log('api', data);
      },
      error: (error) => {
        console.error("API 請求失敗:", error);
      },
      complete: () => {
        console.log('API 請求完成');
      }
    });
  }
}
