import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { TNcartItemsService } from './../../services/tncart-items.service';
import { SharedcartService } from './../../services/sharedcart.service';
import { UserBehaviorService } from 'src/app/services/user-behavior.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserDTO } from 'src/app/interface/userDTO';

import {
  TNproductDTO,
  TNprovariantDTO,
  ColorDTO,
  SizeDTO,
} from 'src/app/interface/TNproductDTO';

import { Lightbox, IAlbum } from 'ngx-lightbox';
import { TnproductService } from 'src/app/services/tnproduct.service';

@Component({
  selector: 'app-shopproductshow',
  templateUrl: './shopproductshow.component.html',
  styleUrls: ['./shopproductshow.component.css'],
})
export class ShopproductshowComponent implements OnInit, OnDestroy {
  private enterTime!: number; // 用來記錄進入商品頁的時間(毫秒) 以計算 dwell time
  album: IAlbum[] = []; // Lightbox 圖片陣列

  productId: number | null = null;
  productDetail: TNproductDTO | null = null;

  // 從後端撈取的變體資料 (若只靠後端 addCart 檢查，可以不顯示庫存)
  productVariants: TNprovariantDTO[] = [];

  // 從後端各 API 撈到的顏色/尺寸/厚度/款式
  colors: ColorDTO[] = [];
  sizes: SizeDTO[] = [];
  thicknesses: Array<{ id: number; name: string }> = [];
  genders: Array<{ id: number; name: string }> = [];

  // 使用者選擇的變體
  selectedColor: number | null = null;
  selectedSize: number | null = null;
  selectedThickness: number | null = null;
  selectedGender: number | null = null;
  selectedVariant: TNprovariantDTO | null = null;

  quantity = 1; // 使用者輸入的購買數量

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private productService: TnproductService,
    private cartItemsService: TNcartItemsService,
    private sharedcartService: SharedcartService,
    private userBehaviorService: UserBehaviorService,
    private authService: AuthService,
    private lightbox: Lightbox
  ) {}

  user?: UserDTO | null;

  ngOnInit(): void {
    this.enterTime = Date.now();

    // 監聽使用者資訊 (若需要帶 memberId 給後端)
    this.authService.user$.subscribe((u) => {
      this.user = u?.user;
    });

    // 1) 取得路由參數
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.productId) {
      console.error('無法取得商品ID');
      return;
    }

    // 2) 紀錄 VIEW_PRODUCT 行為 (可帶 productId)
    this.userBehaviorService.logViewProduct(this.productId).subscribe();

    // 3) 撈取商品詳細 (不含庫存檢查)
    this.productService.getSingleProduct(this.productId).subscribe({
      next: (res: TNproductDTO | null) => {
        this.productDetail = res;
        // 做圖片 album (主圖 + 檢查 -1.jpg, -2.jpg)
        if (this.productDetail?.imageUrl) {
          // 若後端只存一張
          if (!this.productDetail.images) {
            this.productDetail.images = [];
          }
          const mainImg = this.productDetail.imageUrl;
          this.productDetail.images.push(mainImg);

          const mainFullPath = 'assets/images/shop/' + mainImg;
          this.album.push({
            src: mainFullPath,
            thumb: mainFullPath,
            caption: mainImg,
          });

          // 檢查 -1.jpg, -2.jpg ...
          const baseName = mainImg.replace('.jpg', '');
          for (let i = 1; i <= 2; i++) {
            const guessName = `${baseName}-${i}.jpg`;
            const guessPath = `assets/images/shop/${guessName}`;
            this.http.head(guessPath, { observe: 'response' }).subscribe({
              next: (resp) => {
                if (resp.status === 200) {
                  this.productDetail?.images?.push(guessName);
                  this.album.push({
                    src: guessPath,
                    thumb: guessPath,
                    caption: guessName,
                  });
                }
              },
              error: (err) => {
                if (err.status !== 404) {
                  console.error('檔案檢查發生錯誤:', err);
                }
              },
            });
          }
        }
      },
      error: (err: any) => console.error('取得商品詳細失敗:', err),
    });

    // 4) 撈取顏色/尺寸 (若需要使用者先選擇)
    this.productService.getColorsForProduct(this.productId).subscribe({
      next: (colorList: any[]) => {
        this.colors = colorList.filter((c) => c.colorId !== 0);
      },
      error: (err: any) => console.error('取得 color 失敗', err),
    });

    this.productService.getSizesForProduct(this.productId).subscribe({
      next: (sizeList: any[]) => {
        this.sizes = sizeList.filter((s) => s.sizeId !== 0);
      },
      error: (err: any) => console.error('取得 size 失敗', err),
    });

    // 5) 撈取 variants (若你想前端顯示更多資訊)
    this.productService.getProductVariants(this.productId).subscribe({
      next: (vars: any[]) => {
        this.productVariants = vars;
        // 可能從 variants 提取 thickness/gender
        this.thicknesses = this.extractDistinctOptions(
          vars.map((v) => v.thicknessId).filter((id) => id !== 0),
          (id) => this.getThicknessName(id)
        );
        this.genders = this.extractDistinctOptions(
          vars.map((v) => v.genderId).filter((id) => id !== 0),
          (id) => this.getGenderName(id)
        );
      },
      error: (err: any) => console.error('取得 variants 失敗', err),
    });
  }

  /** 提取不同 ID => {id, name} */
  private extractDistinctOptions(
    ids: number[],
    getName: (id: number) => string
  ): Array<{ id: number; name: string }> {
    const uniqueIds = Array.from(new Set(ids));
    return uniqueIds.map((id) => ({
      id,
      name: getName(id),
    }));
  }

  // Example thickness name
  private getThicknessName(id: number): string {
    switch (id) {
      case 1:
        return '1.5mm';
      case 2:
        return '3mm';
      case 3:
        return '5mm';
      case 4:
        return '7mm';
      default:
        return `厚度ID:${id}`;
    }
  }

  // Example gender name
  private getGenderName(id: number): string {
    switch (id) {
      case 1:
        return '女款半身';
      case 2:
        return '女款全身';
      case 3:
        return '男款半身';
      case 4:
        return '男款全身';
      default:
        return `款式ID:${id}`;
    }
  }

  /** 點顏色 */
  onColorClick(c: ColorDTO) {
    if (!c.hasStock) {
      // 前端可阻擋無庫存顏色
      return;
    }
    this.selectedColor = c.colorId;
    // do something
    console.log('選擇color=', c.colorId);
  }

  onSizeClick(s: SizeDTO) {
    if (!s.hasStock) {
      return;
    }
    this.selectedSize = s.sizeId;
  }

  onThicknessClick(t: { id: number; name: string }) {
    this.selectedThickness = t.id;
  }

  onGenderClick(g: { id: number; name: string }) {
    this.selectedGender = g.id;
  }

  /** 若你仍想前端找到 selectedVariant, 可保留 */
  onVariantChange() {
    // ex: find match in productVariants ...
  }

  /** 使用 ngx-lightbox 顯示大圖 */
  openLightbox(index: number): void {
    this.lightbox.open(this.album, index);
  }
  closeLightbox(): void {
    this.lightbox.close();
  }

  /** 數量 +/- */
  increaseQuantity() {
    if (this.quantity < 99) {
      this.quantity++;
    }
  }
  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  onQuantityChange() {
    if (this.quantity < 1) this.quantity = 1;
    if (this.quantity > 99) this.quantity = 99;
  }

  /** 最終 => 呼叫後端 addCart API 做庫存檢查+加購物車 */
  onConfirmAddToCart() {
    // 1) 若 productDetail 還沒載入
    if (!this.productDetail) {
      alert('商品資料尚未載入');
      return;
    }

    // ============ 動態檢查四個變體 =============

    // (A) 若前端顯示 color (this.colors.length > 0)，就要檢查是否 user 已選 color
    if (this.colors.length > 0 && !this.selectedColor) {
      alert('請先選擇顏色');
      return;
    }

    // (B) 若前端顯示 size (this.sizes.length > 0)，就要檢查是否 user 已選 size
    if (this.sizes.length > 0 && !this.selectedSize) {
      alert('請先選擇尺寸');
      return;
    }

    // (C) 若前端顯示 thickness (this.thicknesses.length > 0)，就要檢查是否 user 已選 thickness
    if (this.thicknesses.length > 0 && !this.selectedThickness) {
      alert('請先選擇厚度');
      return;
    }

    // (D) 若前端顯示 gender (this.genders.length > 0)，就要檢查是否 user 已選 gender
    if (this.genders.length > 0 && !this.selectedGender) {
      alert('請先選擇款式');
      return;
    }

    // 2) 組合要傳給後端的 payload
    const payload = {
      productId: this.productId,
      colorId: this.selectedColor ?? 0, // 若沒顯示 color，就帶0
      sizeId: this.selectedSize ?? 0,
      thicknessId: this.selectedThickness ?? 0,
      genderId: this.selectedGender ?? 0,
      quantity: this.quantity,
      memberId: this.user?.memberId || 1,
    };
    console.log('將要傳給後端的 payload:', payload);

    // 3) 呼叫後端 /api/TNproductvariants/addCart
    this.http
      .post('https://localhost:7107/api/TNproductvariants/addCart', payload)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            // 前端更新暫存購物車 + 開panel
            const newItem: TNcartItemDTO = {
              memberId: payload.memberId,
              productvariantsId: res.productvariantsId,
              productName: this.productDetail?.productName || '',
              uproductId: this.productId || 0,
              quantity: this.quantity,
              unitpriceatCart: this.productDetail?.unitPrice || 0,
              imageUrl: this.productDetail?.imageUrl || '',
              isLocked: false,
              condition: 'new',
              creationDate: new Date().toISOString(),
              updatedDate: new Date().toISOString(),

              color: this.findColorNameById(payload.colorId),
              size: this.findSizeNameById(payload.sizeId),
              thickness: this.findThicknessNameById(payload.thicknessId),
              gender: this.findGenderNameById(payload.genderId),
              stock: 0,
            };

            this.cartItemsService.addToCart(newItem);
            this.sharedcartService.openCartPanel();

            // alert('加入購物車成功(後端已檢查庫存)!');
          } else {
            alert(res.message || '無法加入購物車');
          }
        },
        error: (err) => {
          console.error('加入購物車失敗:', err);
          alert('系統異常，無法加入購物車');
        },
      });
  }

  /** 離開頁面 => 紀錄停留時間 */
  ngOnDestroy(): void {
    const leaveTime = Date.now();
    const dwellSeconds = (leaveTime - this.enterTime) / 1000;
    this.userBehaviorService
      .logDwellTime(this.productId!, dwellSeconds)
      .subscribe();
  }

  findColorNameById(colorId: number): string {
    const c = this.colors.find((x) => x.colorId === colorId);
    return c ? c.color : 'N/A';
  }
  findSizeNameById(sizeId: number): string {
    const s = this.sizes.find((x) => x.sizeId === sizeId);
    return s ? s.size : 'N/A';
  }
  findThicknessNameById(thickId: number): string {
    const t = this.thicknesses.find((x) => x.id === thickId);
    return t ? t.name : 'N/A';
  }
  findGenderNameById(genderId: number): string {
    const g = this.genders.find((x) => x.id === genderId);
    return g ? g.name : 'N/A';
  }
}
