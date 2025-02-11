import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { TnproductService } from './../../services/tnproduct.service';
import { TNproductDTO, TNprovariantDTO } from './../../interface/TNproductDTO';
import { TNcartItemsService } from 'src/app/services/tncart-items.service';
import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';

@Component({
  selector: 'app-shopproductshow',
  templateUrl: './shopproductshow.component.html',
  styleUrls: ['./shopproductshow.component.css'],
})
export class ShopproductshowComponent implements OnInit {
  productId: number | null = null;
  productDetail: TNproductDTO | null = null;

  // 從後端取得的變體清單
  productVariants: TNprovariantDTO[] = [];

  // 下拉選單要用的「尺寸 / 顏色」清單
  sizes: { id: number; name: string }[] = [];
  colors: { id: number; name: string }[] = [];
  thickness: { id: number; name: string }[] = [];
  gender: { id: number; name: string }[] = [];

  // 使用者在畫面上選到的尺寸、顏色，以及對應到的「變體」
  selectedSize: number | null = null;
  selectedColor: number | null = null;
  selectedthickness: number | null = null;
  selectedgender: number | null = null;
  selectedVariant: TNprovariantDTO | null = null;

  // 預設購買數量
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: TnproductService,
    private cartItemsService: TNcartItemsService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    // 1) 取得路由參數 (商品ID)
    this.productId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.productId) {
      console.error('無法取得商品ID');
      return;
    }

    // 2) 呼叫後端，取得此商品的主資訊
    this.productService.getSingleProduct(this.productId).subscribe({
      next: (res) => {
        this.productDetail = res;
        console.log('單一商品: ', this.productDetail);
      },
      error: (err) => {
        console.error('取得單一商品失敗', err);
      },
    });

    // 3) 取得該商品的變體清單
    this.productService.getProductVariants(this.productId).subscribe({
      next: (variants) => {
        this.productVariants = variants;
        console.log('變體清單: ', this.productVariants);

        // 4) 解析 color / size 下拉選單
        //   例如 distince colorId, sizeId
        if (this.productVariants && this.productVariants.length > 0) {
          // Distinct color
          const uniqueColors = new Set(
            this.productVariants.map((v) => v.colorId)
          );
          this.colors = Array.from(uniqueColors).map((id) => ({
            id,
            name: this.getColorName(id),
          }));

          // Distinct size
          const uniqueSizes = new Set(
            this.productVariants.map((v) => v.sizeId)
          );
          this.sizes = Array.from(uniqueSizes).map((id) => ({
            id,
            name: this.getSizeName(id),
          }));

          // 設定預設選擇(可先預設第一筆變體)
          this.selectedVariant = this.productVariants[0];
          this.selectedColor = this.selectedVariant.colorId;
          this.selectedSize = this.selectedVariant.sizeId;
          this.selectedthickness = this.selectedVariant.thicknessId;
          this.selectedgender = this.selectedVariant.genderId;
        }
      },
      error: (err) => {
        console.error('取得變體資料失敗', err);
      },
    });
  }

  /**
   * 當使用者在顏色或尺寸下拉選單變動時
   * 透過 colorId + sizeId 找出對應的 selectedVariant
   */
  onVariantChange(): void {
    if (!this.productVariants.length) return;
    this.selectedVariant =
      this.productVariants.find(
        (v) =>
          v.colorId === this.selectedColor &&
          v.sizeId === this.selectedSize &&
          v.thicknessId === this.selectedthickness &&
          v.genderId === this.selectedgender
      ) ?? null;
  }

  /**
   * 加入購物車
   */
  onConfirmAddToCart(): void {
    if (!this.productDetail) {
      console.warn('尚未載入商品資料');
      return;
    }

    const newCartItem: TNcartItemDTO = {
      memberId: 1, // 假設只有一張購物車ID=1
      uproductId: this.productDetail.productId,
      productvariantsId: this.selectedVariant
        ? this.selectedVariant.productvariantsId
        : null,
      quantity: this.quantity,
      unitpriceatCart: this.productDetail.unitPrice,
      isLocked: false,
      condition: 'new',
      creationDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    this.cartItemsService.create(newCartItem).subscribe({
      next: (res) => {
        console.log('新增購物車成功', res);
        // 加入購物車後，可跳轉或顯示提示
        // this.router.navigate(['/shopcart']); // 例如跳到購物車
      },
      error: (err) => {
        console.error('加入購物車失敗', err);
      },
    });
  }

  // 轉換 sizeId -> 尺寸文字
  getSizeName(sizeId: number): string {
    // 你可根據實際定義對應
    const sizeMap: Record<number, string> = {
      1: 'S',
      2: 'M',
      3: 'L',
      4: 'XL',
      5: 'XXL',
      // ...
    };
    return sizeMap[sizeId] || `Size#${sizeId}`;
  }

  // 轉換 colorId -> 顏色文字
  getColorName(colorId: number): string {
    const colorMap: Record<number, string> = {
      1: '紅色',
      2: '藍色',
      3: '黑色',
      4: '白色',
      // ...
    };
    return colorMap[colorId] || `Color#${colorId}`;
  }
}
