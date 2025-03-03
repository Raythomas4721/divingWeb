import { PagedResult } from './../../interface/TNproductDTO';
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
import { AuthService } from 'src/app/services/auth.service';
import { UserDTO } from 'src/app/interface/userDTO';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
})
export class ShopComponent implements OnInit {
  user?: UserDTO | null;
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

  totalCount = 0;
  totalPages = 1;
  currentPage = 1;
  pageSize = 6;

  constructor(
    private cartItemsService: TNcartItemsService,
    private discountService: TndiscountService,
    private productService: TnproductService,
    private http: HttpClient,
    private router: Router,
    private userBehavior: UserBehaviorService,
    private categoryService: TncategoriesService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private reviewService: TnreviewService
  ) {}

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
    this.authService.user$.subscribe((u) => {
      this.user = u;
    });

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
  }

  onOrderChange(event: any): void {
    const orderValue = this.selectedOrder;

    if (orderValue === 'price') {
      this.products.sort(
        (a, b) =>
          (a.discountedPrice ?? a.unitPrice) -
          (b.discountedPrice ?? b.unitPrice)
      );
    } else if (orderValue === 'price-desc') {
      this.products.sort(
        (a, b) =>
          (b.discountedPrice ?? b.unitPrice) -
          (a.discountedPrice ?? a.unitPrice)
      );
    } else {
      // this.loadAllProducts(); // 或保留最初載入順序
    }
  }

  async loadAllProducts(): Promise<void> {
    try {
      // 呼叫帶分頁的 API
      const pagedRes = await firstValueFrom(
        this.productService.getAllProductsPaged(
          this.currentPage,
          this.pageSize,
          '', // 不搜尋 => ''
          this.selectedOrder // 要排序 => 'price-desc' or 'price'...
        )
      );
      // 拿到 { items, totalCount }
      const products = pagedRes.items;
      this.totalCount = pagedRes.totalCount;
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);

      // (B) 設定預設價格
      products.forEach((p) => {
        p['originalPrice'] = p.unitPrice;
        p['discountedPrice'] = p.unitPrice;
      });

      // (C) 拿折扣
      const productIds = products.map((p) => p.productId);
      const discountResults = await firstValueFrom(
        this.discountService.getDiscountsByProducts(productIds)
      );
      discountResults.forEach((dr) => {
        const found = products.find((p) => p.productId === dr.productId);
        if (found && dr.discountValue != null) {
          const rate = dr.discountValue / 100;
          found['discountedPrice'] = Math.round(found.unitPrice * rate);
        }
      });

      // (D) 拿評分 (Promise.all)
      const reviewPromises = products.map((p) =>
        firstValueFrom(this.reviewService.getReviewStatsByProduct(p.productId))
          .then((stats) => {
            p['avgRating'] = stats.avgRating;
            p['reviewCount'] = stats.reviewCount;
          })
          .catch((err) => console.error('取得評分失敗:', err))
      );
      await Promise.all(reviewPromises);

      // (E) 更新 this.products
      this.products = products;
      // 清空其他
      this.searchResults = [];
      this.selectedCategoryId = null;
      this.searchTerm = '';
    } catch (err) {
      console.error('載入所有商品時發生錯誤:', err);
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
    this.userBehavior.logViewProduct(productId).subscribe({
      next: (res) => console.log('紀錄VIEW_PRODUCT成功', res),
      error: (err) => console.error('紀錄VIEW_PRODUCT失敗', err),
    });
  }
  async onSearch(): Promise<void> {
    const keyword = this.searchTerm.trim().toLowerCase();

    if (!keyword) {
      this.searchResults = [];
      this.products = [];
      this.selectedCategoryId = null;
      return;
    }

    // (A) 紀錄 SEARCH 行為
    try {
      await firstValueFrom(this.userBehavior.logSearchKeyword(keyword));
    } catch (err) {
      console.error('記錄搜尋關鍵字時出錯：', err);
    }

    try {
      // (B) 呼叫後端搜尋商品，回傳結果為 { items, totalCount }
      const res = await firstValueFrom(
        this.productService.getAllProducts(keyword)
      );

      // 1. 取出「真正的商品陣列」與「總筆數」
      const products = res.items; // <— 從 res.items 取得商品
      const totalCount = res.totalCount; // <— 如需顯示分頁或總筆數，也可取出

      console.log('搜尋結果 =>', products);

      // 2. 先預設 originalPrice、discountedPrice
      products.forEach((p) => {
        p['originalPrice'] = p.unitPrice;
        p['discountedPrice'] = p.unitPrice; // 預設沒折扣
      });

      // 3. 取出所有 productIds，去後端拿折扣
      const productIds = products.map((p) => p.productId);
      const discountResults = await firstValueFrom(
        this.discountService.getDiscountsByProducts(productIds)
      );

      // 4. 折扣資訊合併
      discountResults.forEach((dr) => {
        const found = products.find((p) => p.productId === dr.productId);
        if (found && dr.discountValue != null) {
          const rate = dr.discountValue / 100; // 80 => 0.8
          found['discountedPrice'] = Math.round(found.unitPrice * rate);
        }
      });

      // 5. 逐筆撈評分 (Promise.all)
      const reviewPromises = products.map((p) =>
        firstValueFrom(this.reviewService.getReviewStatsByProduct(p.productId))
          .then((stats) => {
            p['avgRating'] = stats.avgRating;
            p['reviewCount'] = stats.reviewCount;
          })
          .catch((err) => {
            console.error(`取得商品 ${p.productId} 評分失敗:`, err);
          })
      );
      await Promise.all(reviewPromises);

      // 6. 最後一次性更新 this.searchResults
      this.searchResults = products; // 這裡才把處理後的產品指定給 searchResults

      // 清空其他狀態
      this.products = [];
      this.selectedCategoryId = null;
      this.searchTerm = '';
    } catch (err) {
      console.error('搜尋過程中出錯:', err);
    }
  }

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

  private loadProductsByCategory(categoryId: number) {
    // (A) 先撈該分類的商品
    this.categoryService.getProductsByCategory(categoryId).subscribe({
      next: (data) => {
        this.products = data;
        this.products.forEach((p) => {
          p['originalPrice'] = p.unitPrice;
          p['discountedPrice'] = p.unitPrice; // 預設沒折扣
        });

        // (B) 收集所有 productId
        const productIds = this.products.map((p) => p.productId);

        // (C) 透過批量 API 一次查詢這些商品的折扣
        this.discountService.getDiscountsByProducts(productIds).subscribe({
          next: (discountResults) => {
            discountResults.forEach((dr) => {
              const found = this.products.find(
                (p) => p.productId === dr.productId
              );
              if (found) {
                if (dr.discountValue != null) {
                  const rate = dr.discountValue / 100;
                  found['discountedPrice'] = Math.round(found.unitPrice * rate);
                } else {
                  found['discountedPrice'] = found.unitPrice;
                }
              }
            });
          },
          error: (err) => console.error('取得批量折扣失敗:', err),
        });

        this.products.forEach((p) => {
          this.reviewService.getReviewStatsByProduct(p.productId).subscribe({
            next: (stats) => {
              p['avgRating'] = stats.avgRating;
              p['reviewCount'] = stats.reviewCount;
            },
            error: (err) => console.error('取得評分失敗', err),
          });
        });
        this.searchResults = [];
      },
      error: (err) => console.error('取得分類商品失敗:', err),
    });
  }

  hasSecondVersion(filename: string | null): boolean {
    if (!filename) {
      return false;
    }
    return filename.startsWith('M');
  }
  resetShop() {
    this.selectedCategoryId = null;
    this.products = [];
    this.searchResults = [];
  }

  get pages(): number[] {
    // totalPages 可能是 5 就回傳 [1,2,3,4,5]
    // 注意：當 totalPages 很大時，如果你想做 "...省略..." 的分頁，需要額外邏輯
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAllProducts(); // 重新撈
      window.scrollTo({ top: 0, behavior: 'smooth' }); // 自動回頂部 (平滑)
    }
  }
  goToPage(page: number): void {
    // 邊界檢查 => 頁碼不可小於1或大於totalPages
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    // 呼叫載入資料的函式 (例如 loadAllProducts())
    this.loadAllProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 或者若你是透過 Router 參數做分頁，也可在這裡 navigate
    // this.router.navigate(['/shop'], { queryParams: { page: this.currentPage } });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAllProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
