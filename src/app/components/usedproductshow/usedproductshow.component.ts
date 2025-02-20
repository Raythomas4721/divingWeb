import { Component, OnInit } from '@angular/core';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { ProductsService } from '../../services/products.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TUcategory, TUcreateproductDTO, TUproductDTO, TUcondition } from 'src/app/interface/TUproductDTO';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-usedproductshow',
  templateUrl: './usedproductshow.component.html',
  styleUrls: ['./usedproductshow.component.css']
})
export class UsedproductshowComponent implements OnInit {
  user?: UserDTO | null;
  usedProducts: TUcreateproductDTO[] = [];
  usedCategory: TUcategory[] = [];
  usedCondition: TUcondition[] = [];
  isLoading = true; // 用來顯示載入狀態

  UPForm = new FormGroup({
    categoryId: new FormControl(),
    productName: new FormControl(),
    productDescription: new FormControl(),
    productPrice: new FormControl(),
    productConditionId: new FormControl()
  })


  constructor(private productService: ProductsService, private authService: AuthService) { }

  // 必須要有 ngOnInit 方法
  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user?.user;
      if (user) {
        console.log("用戶資料已載入:", this.user);
        this.loadUsedProducts();
      } else {
        console.log("等待 API 返回，用戶資料尚未載入");
      }
    });
    this.loadUsedProducts();
    this.loadCategory();
    this.loadCondition();
  }
  loadUsedProducts(): void {
    this.productService.getUsedProducts().subscribe({
      next: (data: TUcreateproductDTO[]) => {
        this.usedProducts = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('載入二手商品失敗:', error);
        this.isLoading = false;
      }
    });
  }

  loadCategory() {
    this.productService.getUsedCategory().subscribe({
      next: (data: TUcategory[]) => {
        this.usedCategory = data;
        console.log('categories', this.usedCategory);
      }
    })
  }
  loadCondition() {
    this.productService.getUsedCondition().subscribe({
      next: (data: TUcondition[]) => {
        this.usedCondition = data;
        console.log('condition', this.usedCondition);
      }
    })
  }

  removeImage(productIndex: number, imageIndex: number): void {
    this.usedProducts[productIndex].tUproductImages.splice(imageIndex, 1);
  }
}
