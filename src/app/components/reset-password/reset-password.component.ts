import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  resetPasswordForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [
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
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    const newPassword = this.resetPasswordForm.get('newPassword')?.value ?? '';
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value ?? '';

    // 檢查表單是否有效
    if (this.resetPasswordForm.invalid) {
      this.errorMessage = '請確保密碼符合要求：6~12字元，包含大小寫英文和數字，無特殊符號';
      return;
    }

    // 手動檢查新密碼與確認密碼是否一致
    if (newPassword !== confirmPassword) {
      this.resetPasswordForm.get('confirmPassword')?.setErrors({ notMatching: true });
      this.errorMessage = '新密碼與確認密碼不一致';
      return;
    }

    // 提交到後端
    this.userService.resetPassword(this.token, newPassword).subscribe({
      next: (res) => {
        this.errorMessage = '';
        this.alertService.success(res.message);
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || '重置密碼失敗，請稍後再試';
        this.alertService.error(this.errorMessage);
      },
    });
  }

  autoFillPassword(): void {
    const defaultComfirm = '123ddS'
    const defaultPassword = '123ddS';

    this.resetPasswordForm.patchValue({
      newPassword: defaultComfirm,
      confirmPassword: defaultPassword
    });
  }
}
