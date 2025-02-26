import { ActivatedRoute, Router } from '@angular/router';
import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { TNcartItemsService } from './../../services/tncart-items.service';
import { Component, OnInit } from '@angular/core';
import {
  TNcategoryDTO,
  TNproductDTO,
  TopProductDTO,
} from 'src/app/interface/TNproductDTO';
import { TnreviewService } from 'src/app/services/tnreview.service';
import { TnproductService } from './../../services/tnproduct.service';
import { HttpClient } from '@angular/common/http';
import { TncategoriesService } from 'src/app/services/tncategories.service';
import { UserBehaviorService } from 'src/app/services/user-behavior.service';
import {
  TndiscountService,
  TNdiscount,
} from 'src/app/services/tndiscount.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
})
export class ShopComponent implements OnInit {
  currentDiscount: TNdiscount | null = null;
  album: Array<any> = [];
  // 分類相關
  products: any[] = []; // 分類商品
  mainCats: TNcategoryDTO[] = []; // 1~8
  sideCats: TNcategoryDTO[] = []; // 9~12

  // 商品列表

  searchResults: TNproductDTO[] = [];
  searchTerm: string = '';
  topProducts: TopProductDTO[] = [];
  // 目前選擇的分類 ID（若無就是 null）
  selectedCategoryId: number | null = null;
  selectedOrder = 'menu_order';
  guestId: string = '';

  avgRating: number = 0;
  get ratingWidth(): number {
    // (avgRating / 5) * 100
    return (this.avgRating / 5) * 100;
  }

  constructor(
    private cartItemsService: TNcartItemsService,
    private discountService: TndiscountService,
    private productService: TnproductService,
    private http: HttpClient,
    private router: Router,
    private userBehavior: UserBehaviorService,
    private categoryService: TncategoriesService,
    private route: ActivatedRoute,
    private reviewService: TnreviewService
  ) { }

  ngOnInit(): void {
    this.loadTopProducts();
    const guestIdKey = 'guestId';
    let gid = localStorage.getItem(guestIdKey);
    if (!gid) {
      gid = this.generateUUID();
      localStorage.setItem(guestIdKey, gid);
    }
    this.guestId = gid;
    console.log('GuestId from procategories =>', this.guestId);
    // 1) 載入所有分類，並切出主畫面與側邊要顯示的
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => {
        this.mainCats = cats.filter(
          (c) => c.productCategoryId >= 1 && c.productCategoryId <= 8
        );
        this.sideCats = cats.filter(
          (c) => c.productCategoryId >= 9 && c.productCategoryId <= 12
        );
      },
      error: (err) => console.error('載入分類失敗', err),
    });

    // 2) 監聽路由參數(categoryId)變化，載入對應商品
    // this.route.paramMap.subscribe((params) => {
    //   const categoryIdParam = params.get('categoryId');
    //   if (categoryIdParam) {
    //     this.selectedCategoryId = +categoryIdParam;
    //     this.loadProductsByCategory(this.selectedCategoryId);
    //     // 清空搜尋結果
    //     this.searchResults = [];
    //   } else {
    //     // 沒有 categoryId => 預設空 => 顯示主分類
    //     this.selectedCategoryId = null;
    //     this.products = [];
    //   }
    // });
    // 載入 topProducts
  }

  onOrderChange(event: any): void {
    const orderValue = this.selectedOrder; // 取得目前選擇

    if (orderValue === 'price') {
      // 價格由低到高
      this.products.sort((a, b) => a.unitPrice - b.unitPrice);
    } else if (orderValue === 'price-desc') {
      // 價格由高到低
      this.products.sort((a, b) => b.unitPrice - a.unitPrice);
    } else {
      // 預設排序 (可自行決定要做什麼，如不動或有其他預設邏輯)
      // this.loadAllProducts(); // 或保留最初載入順序
    }
  }

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
  onSearch(): void {
    const keyword = this.searchTerm.trim().toLowerCase();

    // 若關鍵字為空，直接回到主分類狀態
    if (!keyword) {
      this.searchResults = [];
      this.products = [];
      this.selectedCategoryId = null;
      return;
    }

    // 紀錄 SEARCH 行為
    this.userBehavior.logSearchKeyword(keyword).subscribe();

    // 呼叫後端搜尋
    this.productService.getAllProducts(keyword).subscribe({
      next: (res) => {
        console.log('搜尋結果 =>', res);
        this.searchResults = res;

        // 清空 products 與 selectedCategoryId，確保只顯示搜尋結果
        this.products = [];
        this.selectedCategoryId = null;
      },
      error: (err) => console.error('搜尋失敗', err),
    });
  }
  /**
   * 切換到指定的分類（或如果目前已在該分類，就強制刷新商品列表）
   */
  goToShop(categoryId: number) {
    // this.router.navigate(['/shop', categoryId]);
    this.selectedCategoryId = categoryId; // 若你想在程式記錄現在所選ID
    this.searchResults = [];
    this.loadProductsByCategory(categoryId);
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

  /**
   * 從後端撈取指定分類的商品
   */
  private loadProductsByCategory(categoryId: number) {
    // (A) 先撈該分類的商品
    this.categoryService.getProductsByCategory(categoryId).subscribe({
      next: (data) => {
        // 先把商品放到 this.products
        this.products = data;

        // 先暫存 originalPrice = unitPrice
        this.products.forEach((p) => {
          p['originalPrice'] = p.unitPrice;
          p['discountedPrice'] = p.unitPrice; // 預設沒折扣
        });

        // (B) 收集所有 productId
        const productIds = this.products.map((p) => p.productId);

        // (C) 透過批量 API 一次查詢這些商品的折扣
        this.discountService.getDiscountsByProducts(productIds).subscribe({
          next: (discountResults) => {
            // discountResults: { productId, discountValue }[]
            discountResults.forEach((dr) => {
              // 找到對應商品
              const found = this.products.find(
                (p) => p.productId === dr.productId
              );
              if (found) {
                if (dr.discountValue != null) {
                  // 例如 80 => 8折 => 80 / 100 = 0.8
                  const rate = dr.discountValue / 100;
                  found['discountedPrice'] = Math.round(found.unitPrice * rate);
                } else {
                  // 無折扣 => discountedPrice = unitPrice
                  found['discountedPrice'] = found.unitPrice;
                }
              }
            });
          },
          error: (err) => console.error('取得批量折扣失敗:', err),
        });

        // (D) 額外撈每個商品的平均評分
        this.products.forEach((p) => {
          this.reviewService.getReviewStatsByProduct(p.productId).subscribe({
            next: (stats) => {
              // 在 p 新增兩個屬性：p.avgRating, p.reviewCount
              p['avgRating'] = stats.avgRating;
              p['reviewCount'] = stats.reviewCount;
            },
            error: (err) => console.error('取得評分失敗', err),
          });
        });

        // demo: 也可以隨機 sort
        this.products.sort(() => Math.random() - 0.5);

        // 清空搜尋
        this.searchResults = [];
      },
      error: (err) => console.error('取得分類商品失敗:', err),
    });
  }

  // 照片判斷式
  hasSecondVersion(filename: string | null): boolean {
    // 如果檔名第一個字是 'M'，就回傳 true
    if (!filename) {
      return false;
    }

    // link 不為 null/undefined，這時才可 safely 呼叫 startsWith
    return filename.startsWith('M');
  }
  resetShop() {
    this.selectedCategoryId = null;
    this.products = [];
    this.searchResults = [];
    // ... 其他該清空的
    // 如果一開始就只顯示 mainCats，這樣就回到主分類狀態
    // 如果要重新呼叫 loadTopProducts() / loadCategories() 也可以
  }
}
