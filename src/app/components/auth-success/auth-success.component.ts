import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-auth-success',
  templateUrl: './auth-success.component.html',
  styleUrls: ['./auth-success.component.css']
})
export class AuthSuccessComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, private alertService: AlertService, private authService: AuthService) { }

  ngOnInit(): void {
    console.log("✅ auth-success.component.ts 已載入");

    const token = this.getTokenFromUrl();

    if (token) {
      console.log("✅ 取得 Token:", token);
      this.handleGoogleResponse(token);
    } else {
      console.error("❌ 無法取得 Token！");
    }
  }

  getTokenFromUrl(): string | null {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1]);
    return urlParams.get("token");
  }

  handleGoogleResponse(token: string) {
    localStorage.setItem("token", token);

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    console.log("✅ 解析的 Token Payload:", tokenPayload);

    const userId = tokenPayload.userId;
    const userName = tokenPayload.name;
    const userEmail = tokenPayload.email;
    const profilePic = tokenPayload.profilePic ? `data:image/png;base64,${tokenPayload.profilePic}` : "";

    console.log("✅ 用戶 ID:", userId);
    console.log("✅ 用戶名稱:", userName);
    console.log("✅ 用戶 Email:", userEmail);
    console.log("✅ 大頭貼:", profilePic);

    window.location.href = "/";
  }
}
