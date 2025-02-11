import { Component } from '@angular/core';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-used-products',
  templateUrl: './used-products.component.html',
  styleUrls: ['./used-products.component.css']

})
export class UsedProductsComponent {
  constructor(private authService: AuthService, private userService: UserService) { }

  user?: UserDTO | null;
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

}
