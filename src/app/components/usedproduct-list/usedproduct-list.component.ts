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
      this.user = user?.user;
      if (user) {
        console.log("用戶資料已載入:", this.user);
        //this.loadUsedProducts();
      } else {
        console.log("等待 API 返回，用戶資料尚未載入");
      }
    });
    this.loadUsedProducts();
    this.loadCategory();

  }
  loadUsedProducts(): void {
    this.productsService.getUsedProducts(1, 8, this.categoryId).subscribe({
      next: (data: any[]) => {
        this.usedProducts = data;
        //console.log(data);
        this.filteredProducts = [...this.usedProducts];
        //console.log(this.filteredProducts);
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
  // editProduct(productId: number): void {
  //   this.productsService.getProductWithUserId(productId).subscribe({
  //     next: (product) => {

  //        console.log("獲取的商品資料:", product);
  //        console.log(`導航到編輯頁面: /editusedproduct/${productId}`);

  //       this.router.navigate(['/editusedproduct', productId]);
  //       console.log(productId);
  //     }, error: (error) => {
  //       console.error('商品獲取失敗:', error);
  //     }
  //   });
  // }
  editProduct(productId: number): void {
    this.router.navigate(['/editusedproduct', productId]).then(success => {
      if (success) {
        console.log(productId);
      } else {
        console.error('商品獲取失敗:', error);
      }
    });
  }
  filterProducts() {
    // 先回復到完整的商品列表
    this.productsData = this.originalProductsData.filter(product => {
      // 檢查是否有選擇分類
      const matchCategory = this.selectedCategory
        ? product.categoryId == +this.selectedCategory
        : true;

      // 關鍵字搜尋（針對商品名稱與描述）
      const matchKeyword = this.keyword
        ? product.productName.toLowerCase().includes(this.keyword.toLowerCase()) ||
        product.productDescription.toLowerCase().includes(this.keyword.toLowerCase())
        : true;

      // 同時符合分類與關鍵字才會顯示
      return matchCategory && matchKeyword;
    });
  }

}
