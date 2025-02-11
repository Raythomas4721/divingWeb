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
  constructor(private authService: AuthService, private userService: UserService) { }

  user?: UserDTO | null;
  selectedFile: File | null = null;
  previewImage: string | null = null;

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user?.user;
      if (user) {
        console.log("用戶資料已載入:", this.user);
      } else {
        console.log("等待 API 返回，用戶資料尚未載入");
      }
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadProfilePhoto() {
    if (!this.selectedFile) return;
    if (!this.user || !this.user.memberId) {
      console.error("無法上傳，userId 未載入");
      return;
    }

    const formData = new FormData();
    formData.append('memberPhoto', this.selectedFile);

    this.userService.uploadProfilePhoto(formData).subscribe({
      next: res => {
        console.log("圖片上傳成功", res);

        if (this.user) {
          this.user.memberPhoto = res.memberPhoto;
        }

        this.previewImage = null;
        this.selectedFile = null;
      },
      error: err => {
        console.error("圖片上傳失敗", err);
      }
    });
  }
}
