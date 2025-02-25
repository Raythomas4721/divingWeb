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

    const token = this.getTokenFromUrl();

    if (token) {
      this.handleGoogleResponse(token);
    } else {
      console.error("無法取得 Token！");
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

    const userId = tokenPayload.userId;
    const userName = tokenPayload.name;
    const userEmail = tokenPayload.email;
    const profilePic = tokenPayload.profilePic ? `data:image/png;base64,${tokenPayload.profilePic}` : "";

    window.location.href = "/";
  }
}
