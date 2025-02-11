import { ActivatedRoute, Router } from '@angular/router';
import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { TNcartItemsService } from './../../services/tncart-items.service';
import { Component, OnInit } from '@angular/core';
import {
  TNcategoryDTO,
  TNproductDTO,
  TopProductDTO,
} from 'src/app/interface/TNproductDTO';
import { TnproductService } from './../../services/tnproduct.service';
import { HttpClient } from '@angular/common/http';
import { TncategoriesService } from 'src/app/services/tncategories.service';
import { UserBehaviorService } from 'src/app/services/user-behavior.service';
import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
})
export class ShopComponent implements OnInit {
  album: Array<any> = [];
  // 分類相關
  categories: TNcategoryDTO[] = [];
  mainCats: TNcategoryDTO[] = []; // 1~8
  sideCats: TNcategoryDTO[] = []; // 9~12

  // 商品列表
  products: TNproductDTO[] = [];
  searchTerm: string = '';
  topProducts: TopProductDTO[] = [];

  selectedOrder = 'menu_order';
  guestId: string = '';

  constructor(
    private cartItemsService: TNcartItemsService,
    private productService: TnproductService,
    private http: HttpClient,
    private router: Router,
    private userBehavior: UserBehaviorService,
    private categoryService: TncategoriesService,
    private route: ActivatedRoute,
    private _lightbox: Lightbox
  ) {}

  ngOnInit(): void {
    this.loadTopProducts();
    // 1) 載入所有分類，並切出主畫面與側邊要顯示的
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
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
    this.route.paramMap.subscribe((params) => {
      const categoryIdParam = params.get('categoryId');
      if (categoryIdParam) {
        const categoryId = +categoryIdParam;
        this.loadProductsByCategory(categoryId);
      } else {
        this.loadAllProducts();
      }
    });
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
    const keyword = this.searchTerm.trim();
    if (!keyword) {
      // 如果關鍵字是空的，判斷要回到「全部商品」或「分類商品」
      const categoryIdParam = this.route.snapshot.paramMap.get('categoryId');
      if (categoryIdParam) {
        this.loadProductsByCategory(+categoryIdParam);
      } else {
        this.loadAllProducts();
      }
      return;
    }

    this.productService.getAllProducts(keyword).subscribe({
      next: (data) => {
        this.products = data;
        console.log('搜尋結果 =>', data);
      },
      error: (err) => console.error('搜尋失敗', err),
    });
  }
  /**
   * 切換到指定的分類（或如果目前已在該分類，就強制刷新商品列表）
   */
  goToShop(categoryId: number) {
    const currentId = +this.route.snapshot.paramMap.get('categoryId')!;
    // 如果再次點擊同一分類，就手動載入
    if (currentId === categoryId) {
      this.loadProductsByCategory(categoryId); // 強制刷新
    } else {
      // 否則就導航到 /shop/:categoryId
      this.router.navigate(['/shop', categoryId]);
    }
  }

  /**
   * 從後端撈取指定分類的商品
   */
  private loadProductsByCategory(categoryId: number) {
    this.categoryService.getProductsByCategory(categoryId).subscribe({
      next: (data) => {
        this.products = data;
        console.log('取得分類', categoryId, '的商品 =>', data);
      },
      error: (err) => console.error('取得分類商品失敗:', err),
    });
  }

  /**
   * 撈取所有商品
   */
  private loadAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: (allProds) => {
        this.products = allProds;
        console.log('取得全部商品 =>', allProds);
      },
      error: (err) => {
        console.error('取得全部商品失敗:', err);
      },
    });
  }

  // 照片判斷式
  hasSecondVersion(filename: string): boolean {
    // 如果檔名第一個字是 'M'，就回傳 true
    return filename.startsWith('M');
  }
}
