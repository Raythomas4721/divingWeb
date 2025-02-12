import { AlertService } from 'src/app/services/alert.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { UserDTO } from 'src/app/interface/userDTO';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  constructor(private authService: AuthService, private userService: UserService, private alertService: AlertService) { }

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
}
