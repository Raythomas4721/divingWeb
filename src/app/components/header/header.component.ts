import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { UserService } from 'src/app/services/user.service';
import * as $ from 'jquery';
import 'bootstrap';
import { UserDTO } from 'src/app/interface/userDTO';
import { SharedcartService } from './../../services/sharedcart.service';
import { TNcartItemsService } from '../../services/tncart-items.service';
import { UserBehaviorService } from '../../services/user-behavior.service';
import { ModalService } from 'src/app/services/modal.service';
import { jwtDecode } from 'jwt-decode';

// 強制讓 Bootstrap 綁定 jQuery
declare var bootstrap: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor(
    private router: Router,
    private sharedcartService: SharedcartService,
    private userService: UserService,
    private alertService: AlertService,
    private authService: AuthService,
    private cartItemsService: TNcartItemsService,
    private userBehaviorService: UserBehaviorService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) {}
  cartItemCount = 0;
  userForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    ]),
    password: new FormControl('', [Validators.required]),
  });
  registrForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(20),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(12),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(12),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/),
    ]),
    verificationCode: new FormControl(''), // 新增驗證碼欄位
  });
  showVerification = false; // 控制是否顯示驗證碼輸入欄位
  verificationCodeSent = false; // 標記驗證碼是否已發送
  errorMessage = '';
  isLoggedIn = false;
  userName = '';
  user?: UserDTO | null;

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });

    this.modalService.loginModalVisible$.subscribe((visible) => {
      if (visible) {
        $('#popupLogin').modal('show');
      } else {
        $('#popupLogin').modal('hide');
        $('.modal-backdrop').remove();
        $('body').css('padding-right', 0);
      }
    });

    this.authService.user$.subscribe((user) => {
      // console.log('收到 user$', user);
      this.user = user || null;
      this.userName = user?.memberName || '';
      this.isLoggedIn = !!user;
      this.cdr.detectChanges();
    });
    this.cartItemsService.cartItems$.subscribe((items) => {
      // 這裡 items 就是購物車陣列
      this.cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    });
  }
  onRegister(): void {
    const name = this.registrForm.get('name')?.value ?? '';
    const email = this.registrForm.get('email')?.value ?? '';
    const password = this.registrForm.get('password')?.value ?? '';
    const confirmPassword = this.registrForm.get('confirmPassword')?.value;
    const verificationCode = this.registrForm.get('verificationCode')?.value ?? '';

    if (password !== confirmPassword) {
      this.registrForm.get('confirmPassword')?.setErrors({ notMatching: true });
      return;
    }
    if (this.registrForm.invalid) {
      this.errorMessage = '輸入的資訊有誤，請再次確認';
      return;
    }
    // 如果還沒發送驗證碼，則請求發送驗證碼
    if (!this.showVerification) {
      this.userService.requestVerificationCode(email).subscribe({
        next: (res) => {
          this.showVerification = true;
          this.verificationCodeSent = true;
          this.alertService.success('驗證碼已發送到您的電子郵件，請檢查信箱');
          this.registrForm.get('verificationCode')?.setValidators([Validators.required]);
          this.registrForm.get('verificationCode')?.updateValueAndValidity();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || '發送驗證碼失敗，請稍後再試';
          this.alertService.error(this.errorMessage);
        },
      });
    }
    else {
      this.userService.verifyAndRegister(name, email, password, verificationCode).subscribe({
        next: (res) => {
          $('#popupRegistr').modal('hide');
          $('.modal-backdrop').remove();
          this.errorMessage = '';
          this.userForm.reset();
          this.alertService.success(`歡迎${name}，成為我們的新成員!`);
        },
        error: (err) => {
          if (err.status === 400 && err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = '請再次確認輸入的資訊';
          }
          this.alertService.error(
            `註冊失敗，${err.error?.message || '請再次確認輸入的資訊'}`
          );
        },
      });
    }
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
        // $('#popupLogin').modal('hide');
        // $('.modal-backdrop').remove();
        // $('body').css('padding-right', 0);
        this.modalService.hideLoginModal();
        this.errorMessage = '';
        this.userForm.reset();
        this.alertService.success(`歡迎! 登入成功`);

        const token = res.token || localStorage.getItem('token');
        if (token) {
          const decodedToken: any = jwtDecode(token);
          const userId =
            decodedToken.sub || decodedToken.userId || res.memberId || '';
          this.authService.setUserId(userId);
        }

        // 等待 updateUserProfile 完成
        this.authService.updateUserProfile().subscribe({
          next: (user) => {
            this.user = user;
            this.userName = user?.memberName || '';
            // console.log('登入後立即設置 userName:', this.userName);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('更新用戶資訊失敗', err);
          },
        });
      },
      error: (err) => {
        // this.errorMessage = '請填寫正確的帳號密碼';
        this.errorMessage = err.error.message;
        // this.alertService.error('登入失敗，請再次檢查您的帳號密碼');
        this.alertService.error(err.error.message);
      },
    });
  }
  openModalLogin(): void {
    this.modalService.showLoginModal();
  }
  loginWithGoogle(): void {
    window.location.href = 'https://localhost:7107/api/account/google-login';
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
    // 清除 memberId
    this.userBehaviorService.setMemberId(null);

    // **清空前端購物車資料**
    this.cartItemsService.clearCart();
  }

  openCartPanel() {
    this.sharedcartService.openCartPanel();
  }
  goToShop() {
    this.router.navigateByUrl('/').then(() => {
      this.router.navigateByUrl('/shop');
    });
  }
  autoFillPassword(): void {
    const defaultPassword = '123ddA';

    this.userForm.patchValue({ password: defaultPassword });
  }
}
