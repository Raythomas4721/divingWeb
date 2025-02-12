import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { UserService } from 'src/app/services/user.service';
import * as $ from 'jquery';
import 'bootstrap';
import { UserDTO } from 'src/app/interface/userDTO';

// 強制讓 Bootstrap 綁定 jQuery
declare var bootstrap: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private authService: AuthService
  ) { }
  userForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    ]),
    password: new FormControl('', [Validators.required]),
  });
  registrForm = new FormGroup({
    name: new FormControl('', [
      Validators.required, Validators.minLength(2), Validators.maxLength(20)
    ]),
    email: new FormControl("", [
      Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
    ]),
    password: new FormControl("", [
      Validators.required, Validators.minLength(6), Validators.maxLength(12), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/)
    ]),
    confirmPassword: new FormControl("", [
      Validators.required, Validators.minLength(6), Validators.maxLength(12), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/)
    ])
  })
  errorMessage = '';
  isLoggedIn = false;
  userName = '';
  user?: UserDTO | null;

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.user = user;
        this.userName = user.user.memberName;
        this.isLoggedIn = true;
      }
    })
  }
  onRegister(): void {
    const name = this.registrForm.get('name')?.value ?? "";
    const email = this.registrForm.get('email')?.value ?? "";
    const password = this.registrForm.get('password')?.value ?? "";
    const confirmPassword = this.registrForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.registrForm.get('confirmPassword')?.setErrors({ notMatching: true });
      return;
    }
    if (this.registrForm.invalid) {
      this.errorMessage = '輸入的資訊有誤，請再次確認';
      return;
    }

    this.userService.register(name, email, password).subscribe({
      next: (res) => {
        $('#popupRegistr').modal('hide');
        $('.modal-backdrop').remove();
        this.errorMessage = "";
        this.userForm.reset();
        this.alertService.success(`歡迎${name}，成為我們的新成員!`);
      },
      error: err => {
        if (err.status === 400 && err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = '請再次確認輸入的資訊';
        }
        this.alertService.error(`註冊失敗，${err.error?.message || '請再次確認輸入的資訊'}`);

      }
    })
  }

  onLogin(): void {
    const username = this.userForm.get('username')?.value ?? '';
    const password = this.userForm.get('password')?.value ?? '';
    if (this.userForm.invalid) {
      this.errorMessage = '請填寫正確的帳號密碼';
      return;
    }
    this.userService.login(username, password).subscribe({
      next: (res) => {
        this.isLoggedIn = true;
        localStorage.setItem('token', res.token);

        $('#popupLogin').modal('hide');
        $('.modal-backdrop').remove();
        $('body').css('padding-right', 0);
        this.errorMessage = "";
        this.userForm.reset();
        this.alertService.success(`登入成功，歡迎!`);
        this.authService.updateUserProfile();


        this.authService.user$.subscribe(user => {
          this.user = user;
          this.userName = user?.memberName || '';
        });
      },
      error: (err) => {
        this.errorMessage = '請填寫正確的帳號密碼';
        this.alertService.error('登入失敗，請再次檢查您的帳號密碼');
      },
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.userName = '';
    this.authService.clearUserProfile();
    this.alertService.success('已成功登出！');
    this.authService.user$.subscribe(() => {
      this.user = null;
    });
  }
}
