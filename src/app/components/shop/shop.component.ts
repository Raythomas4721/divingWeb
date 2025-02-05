import { ActivatedRoute, Router } from '@angular/router';
import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { TNcartItemsService } from './../../services/tncart-items.service';
import { Component, OnInit } from '@angular/core';
import { TNproductDTO, TNprovariantDTO } from 'src/app/interface/TNproductDTO';
import { TnproductService } from './../../services/tnproduct.service';
import { HttpClient } from '@angular/common/http';
import { TncategoriesService } from 'src/app/services/tncategories.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
})
export class ShopComponent implements OnInit {
  products: TNproductDTO[] = [];
  // 存放某個商品的變體資料
  productVariants: TNprovariantDTO[] = [];
  // 從變體中獨立出來的選項（例如尺寸與顏色）
  sizes: any[] = []; // e.g. [{ id: 1, name: 'S' }, { id: 2, name: 'M' }, ...]
  colors: any[] = []; // e.g. [{ id: 1, name: '紅色' }, { id: 2, name: '藍色' }, ...]
  // 使用者目前選擇的尺寸與顏色
  selectedSize: number | null = null;
  selectedColor: number | null = null;
  // 根據所選擇比對出的變體
  selectedVariant: TNprovariantDTO | null = null;
  // 目前正在選擇變體的商品
  selectedProduct: TNproductDTO | null = null;

  constructor(
    private cartItemsService: TNcartItemsService,
    private productService: TnproductService,
    private http: HttpClient,
    private router: Router,
    private categoryService: TncategoriesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const categoryIdParam = params.get('categoryId');
      console.log('categoryIdParam =>', categoryIdParam);

      if (categoryIdParam) {
        // 轉成數字
        const categoryId = +categoryIdParam;
        // 撈該分類商品
        this.categoryService.getProductsByCategory(categoryId).subscribe({
          next: (data) => {
            this.products = data;
            console.log('取得分類', categoryId, '的商品', data);
          },
          error: (err) => console.error('取得分類商品失敗:', err),
        });
      } else {
        // 如果沒有分類ID，就載入所有商品
        this.productService.getAllProducts().subscribe({
          next: (allProds) => {
            this.products = allProds;
            console.log('取得全部商品', allProds);
          },
          error: (err) => {
            console.error('取得全部商品失敗:', err);
          },
        });
      }
    });
    // 載入所有商品資料
    // this.productService.getAllProducts().subscribe({
    //   next: (data) => {
    //     this.products = data;
    //     console.log('商品列表', this.products);
    //   },
    //   error: (err) => {
    //     console.error('取得商品失敗', err);
    //   },
    // });
    // this.route.paramMap.subscribe((params) => {
    //   const categoryIdParam = params.get('categoryId');
    //   console.log('categoryIdParam =>', categoryIdParam);

    //   if (categoryIdParam) {
    //     const categoryId = +categoryIdParam;
    // 1) 撈該分類底下所有商品
    //     this.categoryService.getProductsByCategory(categoryId).subscribe({
    //       next: (data) => {
    //         this.products = data;
    //         console.log('取得分類', categoryId, '的商品', data);
    //       },
    //       error: (err) => console.error('取得分類商品失敗:', err),
    //     });
    //   } else {
    //     // 2) 如果沒有分類ID，就載入所有商品
    //     this.productService.getAllProducts().subscribe({
    //       next: (allProds) => {
    //         this.products = allProds;
    //         console.log('取得全部商品', allProds);
    //       },
    //       error: (err) => {
    //         console.error('取得全部商品失敗:', err);
    //       },
    //     });
    //   }
    // });
  }

  /**
   * 當使用者點擊「Add to cart」時
   * 如果該商品有變體，先載入變體資料並顯示變體選項的 Modal
   */
  onAddToCart(products: TNproductDTO) {
    this.selectedProduct = products;
    this.productService.getProductVariants(products.productId).subscribe({
      next: (data) => {
        this.productVariants = data;
        if (this.productVariants && this.productVariants.length > 0) {
          // 從變體中獨立出尺寸與顏色選項
          this.sizes = Array.from(
            new Set(this.productVariants.map((v) => v.sizeId))
          ).map((id) => ({
            id: id,
            name: this.getSizeName(id),
          }));
          this.colors = Array.from(
            new Set(this.productVariants.map((v) => v.colorId))
          ).map((id) => ({
            id: id,
            name: this.getColorName(id),
          }));
          // 設定預設選項（以第一筆變體資料為預設）
          this.selectedVariant = this.productVariants[0];
          this.selectedSize = this.selectedVariant.sizeId;
          this.selectedColor = this.selectedVariant.colorId;
          // 此時透過 HTML 的 Modal 顯示變體選項
        } else {
          // 若該商品沒有變體資料，則直接建立購物車明細
          this.createCartItem(null);
        }
      },
      error: (err) => {
        console.error('取得變體資料失敗', err);
      },
    });
  }

  /**
   * 當使用者在尺寸或顏色下拉選單改變選擇時呼叫
   */
  onVariantChange(): void {
    this.selectedVariant =
      this.productVariants.find(
        (v) =>
          v.sizeId === +this.selectedSize! && v.colorId === +this.selectedColor!
      ) ?? null;
  }

  /**
   * 當使用者按下 Confirm Add to Cart 時
   */
  onConfirmAddToCart(): void {
    this.createCartItem(this.selectedVariant);
    // 新增成功後關閉 Modal
    this.cancelVariantSelection();
  }

  /**
   * 建立購物車明細
   * @param variant 若為 null 則代表商品沒有變體資料
   */
  createCartItem(variant: TNprovariantDTO | null) {
    const newCartItem: TNcartItemDTO = {
      memberId: 1, // 請依實際情況設定購物車 ID
      uproductId: this.selectedProduct!.productId,
      productvariantsId: variant ? variant.productvariantsId : null,
      quantity: 2, // 可讓使用者自行設定數量
      unitpriceatCart: this.selectedProduct!.unitPrice,
      isLocked: false,
      condition: 'new',
      creationDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };
    this.cartItemsService.create(newCartItem).subscribe((data) => {
      console.log('新增成功', data);
      this.router.navigate(['shopcart']);
    });
  }

  /**
   * 取消變體選擇，重置相關狀態並關閉 Modal
   */
  cancelVariantSelection(): void {
    this.selectedProduct = null;
    this.productVariants = [];
    this.sizes = [];
    this.colors = [];
    this.selectedVariant = null;
    this.selectedSize = null;
    this.selectedColor = null;
  }

  // 輔助函數：根據 sizeId 轉換為對應的尺寸名稱
  getSizeName(sizeId: number): string {
    const sizeMap: { [key: number]: string } = {
      1: 'S',
      2: 'M',
      3: 'L',
      4: 'XL',
    };
    return sizeMap[sizeId] || '未知';
  }

  // 輔助函數：根據 colorId 轉換為對應的顏色名稱
  getColorName(colorId: number): string {
    const colorMap: { [key: number]: string } = {
      1: '紅色',
      2: '藍色',
      3: '綠色',
      4: '黑色',
    };
    return colorMap[colorId] || '未知';
  }
}
