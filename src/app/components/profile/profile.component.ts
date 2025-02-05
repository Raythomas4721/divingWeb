import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDTO } from 'src/app/interfaces/userDTO';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  constructor(private userService: UserService) { }
  userId = "";
  user?: UserDTO;

  ngOnInit(): void {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      this.userId = JSON.parse(savedUser).memberId;
    }
    this.userService.getUserProfile(this.userId).subscribe({
      next: res => {
        console.log('成功', res);
        this.user = res;
      },
      error: err => {
        console.log('錯誤', err);
      }
    })
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewImage = document.querySelector('#previewImage') as HTMLImageElement;
        previewImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
