import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { UserService } from 'src/app/services/user.service';
import * as $ from 'jquery';
import 'bootstrap';

// 強制讓 Bootstrap 綁定 jQuery
declare var bootstrap: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  userForm = new FormGroup({
    'username': new FormControl("", [Validators.required, Validators.minLength(3)]),
    'password': new FormControl("", [Validators.required]),
  })
  errorMessage = "";
  constructor(private userService: UserService, private alertService: AlertService) { }
  onLogin(): void {
    if (this.userForm.invalid) {
      this.errorMessage = "請填寫正確的帳號密碼"
      return
    }
    const username = this.userForm.get('username')?.value ?? "";
    const password = this.userForm.get('password')?.value ?? "";
    this.userService.login(username, password).subscribe({
      next: res => {
        console.log("jQuery version:", $.fn.jquery);
        console.log("Bootstrap modal function:", typeof ($ as any)('#popupLogin').modal);
        $('#popupLogin').modal('hide');
        $('.modal-backdrop').remove();
        $('body').css('padding-right', 0);
        const memberName = res.user?.memberName ?? "您";
        const message = res.message ?? "";
        this.alertService.success(`歡迎${memberName}，${message} !`);
      },
      error: err => {
        this.alertService.error("登入失敗，請再次檢查您的帳號密碼  :(");
      }
    });
  }

}

