import { Component } from '@angular/core';
import { TUproductDTO, TUcategory } from 'src/app/interface/TUproductDTO';
import { UserDTO } from 'src/app/interface/userDTO';
import { ProductsService } from '../../services/products.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { error } from 'jquery';
@Component({
  selector: 'app-usedproduct-list',
  templateUrl: './usedproduct-list.component.html',
  styleUrls: ['./usedproduct-list.component.css']
})
export class UsedproductListComponent {
  user?: UserDTO | null;
  usedProducts: any[] = [];
  keyword: string = '';
  filteredProducts: any[] = [];
  categoryId: number | null = null;
  usedCategory: TUcategory[] = [];
  productsData: any[] = [];// 確保型別為陣列
  originalProductsData: any[] = [];
  // courseCategories: { [key: string]: string; } | undefined
  selectedCategory: string = ''; // 選擇的分類 ID
  constructor(
    private productsService: ProductsService,
    private authService: AuthService,
    private router: Router,
  ) { }
  // 必須要有 ngOnInit 方法
  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        console.log("用戶資料已載入:", this.user);
        this.loadUsedProducts();
      } else {
        console.log("等待 API 返回，用戶資料尚未載入");
      }
    });
    // this.loadUsedProducts();
    this.loadCategory();

  }
  loadUsedProducts(): void {
    if (!this.user) {
      console.warn("未登入，無法獲取會員商品");
      return;
    }
    this.productsService.getMyUsedProducts().subscribe({
      next: (data: any[]) => {
        this.usedProducts = data;
        //console.log(data);
        this.filteredProducts = [...this.usedProducts];
        //console.log(this.filteredProducts);
        console.log("會員商品載入成功:", this.usedProducts);
      },
      error: (error: HttpErrorResponse) => {
        console.error('載入二手商品失敗:', error);
        // alert('請先登入會員!');
        // this.router.navigate(['user/login']);
      }
    });
  }
  loadCategory() {
    this.productsService.getUsedCategory().subscribe({
      next: (data: TUcategory[]) => {
        this.usedCategory = data;
        console.log('categories', this.usedCategory);
      }
    })
  }
  editProduct(productId: number): void {
    this.router.navigate(['/usedproductedit', productId]).then(success => {
      console.log(`導航到編輯頁面: /usedproductedit/${productId}`);
      if (success) {
        // console.log(`導航到編輯頁面: /editusedproduct/${productId}`);
        console.log(productId);
      } else {
        console.error('商品獲取失敗:', error);
      }
    });
  }
  deleteProduct(productId: number): void {
    if (!confirm('確定要刪除此商品嗎？')) {
      return; // 如果使用者取消刪除，就不執行後續動作
    }

    this.productsService.deleteProduct(productId).subscribe({
      next: (response) => {
        console.log('刪除成功:', response);
        // 更新畫面，移除已刪除的商品
        this.usedProducts = this.usedProducts.filter(p => p.productId !== productId);
        this.filteredProducts = this.filteredProducts.filter(p => p.productId !== productId);
      },
      error: (error: HttpErrorResponse) => {
        console.error('刪除商品失敗:', error);
        alert('刪除商品失敗，請稍後再試！');
      }
    });
  }

  // filterProducts() {
  //   // 先回復到完整的商品列表
  //   this.productsData = this.originalProductsData.filter(product => {
  //     // 檢查是否有選擇分類
  //     const matchCategory = this.selectedCategory
  //       ? product.categoryId == +this.selectedCategory
  //       : true;

  //     // 關鍵字搜尋（針對商品名稱與描述）
  //     const matchKeyword = this.keyword
  //       ? product.productName.toLowerCase().includes(this.keyword.toLowerCase()) ||
  //       product.productDescription.toLowerCase().includes(this.keyword.toLowerCase())
  //       : true;

  //     // 同時符合分類與關鍵字才會顯示
  //     return matchCategory && matchKeyword;
  //   });
  // }

}
