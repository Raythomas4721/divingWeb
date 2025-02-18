import { AlertService } from 'src/app/services/alert.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { UserDTO } from 'src/app/interface/userDTO';
import { filter } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  constructor(private authService: AuthService, private userService: UserService, private alertService: AlertService) { }

  editProfileForm: FormGroup = new FormGroup({
    memberName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    memberEmail: new FormControl('', [Validators.required, Validators.email]),
    memberPhone: new FormControl(''),
    memberAddress: new FormControl(''),
    urgentContact: new FormControl(''),
    urgentPhone: new FormControl('')
  });
  changePasswordForm: FormGroup = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(12),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/)
    ]),
    confirmNewPassword: new FormControl('', [Validators.required])
  });

  user?: UserDTO | null;
  selectedFile: File | null = null;
  previewImage: string | null = null;
  showUserImage: string | null = null;

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user?.user;
      if (user) {
        if (user.user.memberPhoto) {
          this.convertToBase64(user.user.memberPhoto);
        }
      } else {
        console.log("等待 API 返回，用戶資料尚未載入");
      }
    });
    // 監聽 confirmNewPassword 確保與 newPassword 一致
    this.changePasswordForm.get('confirmNewPassword')?.valueChanges.subscribe(value => {
      const newPassword = this.changePasswordForm.get('newPassword')?.value;
      if (value !== newPassword) {
        this.changePasswordForm.get('confirmNewPassword')?.setErrors({ notMatching: true });
      } else {
        this.changePasswordForm.get('confirmNewPassword')?.setErrors(null);
      }
    });
  }
  private convertToBase64(photo: any) {
    if (typeof photo === 'string') {
      // console.log("處理純 Base64 字串，補上前綴");
      this.showUserImage = `data:image/png;base64,${photo}`;
    } else {
      console.error("無法解析圖片格式");
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.previewImage = null;


    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;

      // 取得圖片的 Base64 部分，去除 `data:image/...;base64,`
      const newBase64 = base64String.split(',')[1];
      const currentBase64 = this.showUserImage ? this.showUserImage.split(',')[1] : null;

      // 檢查是否與目前的圖片相同
      if (currentBase64 && newBase64 === currentBase64) {
        console.warn("這張圖片已經上傳過了！");
        alert("這張圖片已經上傳過了！");
        return;
      }
      this.selectedFile = file;
      this.previewImage = base64String;

    };
    reader.readAsDataURL(file);
  }

  clearSelectedFile() {
    this.selectedFile = null;
    this.previewImage = null;
  }

  uploadProfilePhoto() {
    if (!this.selectedFile) return;
    if (!this.user || !this.user.memberId) {
      console.error("無法上傳，userId 未載入");
      return;
    }

    const formData = new FormData();
    formData.append('photo', this.selectedFile);

    this.userService.uploadProfilePhoto(formData).subscribe({
      next: res => {
        console.log("圖片上傳成功", res);
        this.alertService.success(`圖片上傳成功`);
        this.showUserImage = res.memberPhoto;
        this.previewImage = null;
        this.selectedFile = null;

      },
      error: err => {
        console.error("圖片上傳失敗", err);
        this.alertService.error(`圖片上傳失敗, ${err.error.message || '請稍後再試'}`);
      }
    });
  }
  openEditProfileModal() {
    if (this.user) {
      this.editProfileForm.patchValue({
        memberName: this.user.memberName || '',
        memberEmail: this.user.memberEmail || '',
        memberPhone: this.user.memberPhone || '',
        memberAddress: this.user.memberAddress || '',
        urgentContact: this.user.urgentContact || '',
        urgentPhone: this.user.urgentPhone || ''
      });
    }
    $('#editProfileModal').modal('show');
  }

  onSubmitEditProfile() {
    if (this.editProfileForm.invalid) return;

    const updatedProfile = this.editProfileForm.value;
    console.log(updatedProfile);
    this.userService.updateUserProfile(updatedProfile).subscribe({
      next: (res) => {
        this.alertService.success('個人資料更新成功');
        $('#editProfileModal').modal('hide');
        this.authService.updateUserProfile();
      },
      error: (err) => {
        this.alertService.error(`更新失敗: ${err.error.message || '請稍後再試'}`);
      }
    });
  }
  openChangePasswordModal() {
    this.changePasswordForm.reset();
    $('#changePasswordModal').modal('show');
  }

  onSubmitChangePassword() {
    if (this.changePasswordForm.invalid) return;

    const changePasswordData = this.changePasswordForm.value;

    this.userService.changePassword(changePasswordData).subscribe({
      next: (res) => {
        this.alertService.success('密碼變更成功');
        $('#changePasswordModal').modal('hide');
      },
      error: (err) => {
        this.alertService.error(`密碼變更失敗: ${err.error.message || '請稍後再試'}`);
      }
    });
  }
}
