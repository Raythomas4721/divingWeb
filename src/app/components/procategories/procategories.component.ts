import {
  TNcategoryDTO,
  TNproductDTO,
  TopProductDTO,
} from './../../interface/TNproductDTO';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TncategoriesService } from 'src/app/services/tncategories.service';
import { TnproductService } from './../../services/tnproduct.service';
import { UserBehaviorService } from './../../services/user-behavior.service';
@Component({
  selector: 'app-procategories',
  templateUrl: './procategories.component.html',
  styleUrls: ['./procategories.component.css'],
})
export class ProcategoriesComponent {
  // 所有分類
  categories: TNcategoryDTO[] = [];
  // 分出主畫面要顯示(1~8)的分類
  mainCats: TNcategoryDTO[] = [];
  // 分出側邊欄要顯示(9~12)的分類
  sideCats: TNcategoryDTO[] = [];
  // 商品
  searchResults: TNproductDTO[] = [];
  //種類沒辦法用價格排序
  // selectedOrder = 'menu_order';
  topProducts: TopProductDTO[] = [];
  searchTerm: string = '';
  guestId: string = '';

  constructor(
    private categoryService: TncategoriesService,
    private productService: TnproductService,
    private userBehavior: UserBehaviorService,
    private router: Router
  ) {}
  ngOnInit() {
    this.loadTopProducts();
    const guestIdKey = 'guestId';
    let gid = localStorage.getItem(guestIdKey);
    if (!gid) {
      gid = this.generateUUID();
      localStorage.setItem(guestIdKey, gid);
    }
    this.guestId = gid;
    console.log('GuestId from procategories =>', this.guestId);
    // 撈取所有分類
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        // 將 1~8 的分類切出來
        this.mainCats = this.categories.filter(
          (c) => c.productCategoryId >= 1 && c.productCategoryId <= 8
        );
        // 將 9~12 (或你要的區間)的分類切出來
        this.sideCats = this.categories.filter(
          (c) => c.productCategoryId >= 9 && c.productCategoryId <= 12
        );
      },
      error: (err) => console.error(err),
    });
  }

  //種類沒辦法用價格排序
  // onOrderChange(event: any): void {
  //   const orderValue = this.selectedOrder;
  //   if (orderValue === 'price') {
  //     this.searchResults.sort((a, b) => a.unitPrice - b.unitPrice);
  //   } else if (orderValue === 'price-desc') {
  //     this.searchResults.sort((a, b) => b.unitPrice - a.unitPrice);
  //   } else {
  // 預設排序 (可自行決定要做什麼，如不動或有其他預設邏輯)
  // this.loadAllProducts(); // 或保留最初載入順序
  //   }
  // }

  loadTopProducts(): void {
    this.productService.getTopProducts(5).subscribe({
      next: (data) => {
        this.topProducts = data;
        console.log('Top products =>', data);
      },
      error: (err) => console.error('取得 top products 失敗', err),
    });
  }

  onClickProduct(productId: number): void {
    console.log('準備呼叫 logViewProduct!');
    // 呼叫 userBehaviorService.logViewProduct
    this.userBehavior.logViewProduct(productId).subscribe({
      next: (res) => console.log('紀錄VIEW_PRODUCT成功', res),
      error: (err) => console.error('紀錄VIEW_PRODUCT失敗', err),
    });
  }

  // 按下 Search 或送出表單時呼叫

  onSearch(): void {
    const keyword = this.searchTerm.trim().toLowerCase();
    if (!keyword) {
      // 如果沒輸入任何東西，就恢復原狀
      this.searchResults = [];

      return;
    }
    // 在呼叫後端搜尋 API 前，也可記錄一次 SEARCH 行為
    this.userBehavior.logSearchKeyword(keyword).subscribe({
      next: (res) => console.log('紀錄SEARCH成功', res),
      error: (err) => console.error('紀錄SEARCH失敗', err),
    });
    // 呼叫 service 搜尋商品
    this.productService.getAllProducts(keyword).subscribe({
      next: (data) => {
        // 將搜尋結果放到 searchResults
        this.searchResults = data;
        console.log('搜尋結果', data);
      },
      error: (err) => console.error('搜尋失敗', err),
    });
  }

  goToShop(productCategoryId: number) {
    // 跳轉到 /shop/123
    console.log('categoryId =>', productCategoryId);
    this.router.navigate(['/shop', productCategoryId]);
  }
  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
  }
  generateUUID(): string {
    // 最常見的 UUID v4 生成方式之一
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
