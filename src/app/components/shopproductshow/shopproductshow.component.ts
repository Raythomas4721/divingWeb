import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { TNcartItemsService } from './../../services/tncart-items.service';
import { SharedcartService } from './../../services/sharedcart.service';
import { UserBehaviorService } from 'src/app/services/user-behavior.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserDTO } from 'src/app/interface/userDTO';
import { AlertService } from 'src/app/services/alert.service';

import {
  TNproductDTO,
  TNprovariantDTO,
  ColorDTO,
  SizeDTO,
} from 'src/app/interface/TNproductDTO';

import { Lightbox, IAlbum } from 'ngx-lightbox';
import { TnproductService } from 'src/app/services/tnproduct.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TnreviewService } from 'src/app/services/tnreview.service';
import { TNreviewDTO } from 'src/app/interface/TNreviewDTO';
import {
  TNdiscount,
  TndiscountService,
} from 'src/app/services/tndiscount.service';

@Component({
  selector: 'app-shopproductshow',
  templateUrl: './shopproductshow.component.html',
  styleUrls: ['./shopproductshow.component.css'],
})
export class ShopproductshowComponent implements OnInit, OnDestroy {
  user?: UserDTO | null;
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
  //商品描述欄位
  attributes: { label: string; values: string[] }[] = [];
  cartItems: TNcartItemDTO[] = [];

  // (A) 評論相關
  reviewForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  reviews: TNreviewDTO[] = []; // 全部評論
  avgRating: number = 0; // 平均評分
  reviewCount: number = 0; // 評論數量
  editingReview: TNreviewDTO | null = null;

  // 動態計算星星寬度
  get ratingWidth(): number {
    return (this.avgRating / 5) * 100;
  }

  // 折扣相關
  currentDiscount: TNdiscount | null = null;
  discountedPrice: number | null = null; // 最終計算後的折扣價

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private productService: TnproductService,
    private cartItemsService: TNcartItemsService,
    private sharedcartService: SharedcartService,
    private userBehaviorService: UserBehaviorService,
    private authService: AuthService,
    private lightbox: Lightbox,
    private fb: FormBuilder,
    private reviewService: TnreviewService,
    private alertService: AlertService,
    private discountService: TndiscountService
  ) {}

  ngOnInit(): void {
    // 1) 取得 route 參數
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.productId) {
      console.error('無法取得商品ID');
      return;
    }

    // 2) 紀錄進入頁面的時間
    this.enterTime = Date.now();

    // 3) 監聽使用者資訊
    this.authService.user$.subscribe((u) => {
      this.user = u?.user;
      if (this.user?.memberId) {
        this.reviewForm.patchValue({ memberId: this.user.memberId });
      }
    });

    // 4) 監聽購物車
    this.cartItemsService.cartItems$.subscribe((items) => {
      this.cartItems = items;
    });

    // 5) 建立 Reactive Form for 評論
    this.initReviewForm();

    // ★ 6) 先撈商品詳細 => 再撈折扣 => 再載入顏色、尺寸、variants ...
    this.loadProductDetailAndDiscount();

    // 7) 撈取評論(非同步)
    this.loadReviewsAndStats();
  }

  initReviewForm() {
    this.reviewForm = this.fb.group({
      productId: [this.productId],
      memberId: [this.user?.memberId],
      reviewRating: [
        null,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      reviewContent: ['', Validators.required],
    });
  }

  loadReviewsAndStats() {
    if (!this.productId) return;

    // A) 撈取全部評論
    this.reviewService.getAllReviewsByProduct(this.productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        // 如果使用者已經評論過，預填表單
        const existingReview = this.reviews.find(
          (r) => r.memberId === this.user?.memberId
        );
        if (existingReview) {
          this.editingReview = existingReview;
          this.reviewForm.setValue({
            productId: existingReview.productId,
            memberId: existingReview.memberId,
            reviewRating: existingReview.reviewRating,
            reviewContent: existingReview.reviewContent,
          });
        }
      },
      error: (err) => console.error('撈取評論失敗', err),
    });

    // B) 撈取「平均評分、評論數量」
    this.reviewService.getReviewStatsByProduct(this.productId).subscribe({
      next: (stats) => {
        this.avgRating = stats.avgRating;
        this.reviewCount = stats.reviewCount;
      },
      error: (err) => console.error('撈取評分/評論數失敗', err),
    });
  }

  // ★ 重點：先撈商品 => 再查折扣 => 再撈顏色/尺寸/variants
  loadProductDetailAndDiscount() {
    if (!this.productId) return;

    // (A) 紀錄行為
    this.userBehaviorService.logViewProduct(this.productId).subscribe();

    // (B) 先撈商品詳細
    this.productService.getSingleProduct(this.productId).subscribe({
      next: (res) => {
        this.productDetail = res;
        if (!this.productDetail) {
          console.error('找不到商品資料');
          return;
        }

        // 建立相簿
        this.setupImages();

        // (C) 撈折扣( by productId )
        this.discountService
          .getDiscountsByProducts([this.productId!])
          .subscribe({
            next: (results) => {
              if (results.length > 0) {
                // 假設只查一個 productId => results[0]
                const dr = results[0];
                // dr.discountValue => 80 => 8折 => 80/100=0.8
                const rate = (dr.discountValue || 100) / 100;
                this.discountedPrice = Math.round(
                  this.productDetail!.unitPrice * rate
                );
                this.currentDiscount = {
                  discountId: 0, // 可能無法取得, 先給0
                  discountName: '', // 可能無法取得
                  productCategoryId: null,
                  discountValue: dr.discountValue,
                  startDate: null,
                  endDate: null,
                };
              } else {
                // 無折扣
                this.discountedPrice = this.productDetail?.unitPrice ?? null;
                this.currentDiscount = null;
              }
            },
            error: (err) => console.error('取得批量折扣失敗:', err),
          });

        // (D) 再撈顏色 / 尺寸 / variants
        this.loadColors();
        this.loadSizes();
        this.loadVariants();
      },
      error: (err) => {
        console.error('取得商品詳細失敗:', err);
      },
    });
  }

  setupImages() {
    if (!this.productDetail?.imageUrl) return;

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

  loadColors() {
    if (!this.productId) return;
    this.productService.getColorsForProduct(this.productId).subscribe({
      next: (colorList: any[]) => {
        this.colors = colorList.filter((c) => c.colorId !== 0);
        this.buildAttributes();
      },
      error: (err) => console.error('取得 color 失敗', err),
    });
  }

  loadSizes() {
    if (!this.productId) return;
    this.productService.getSizesForProduct(this.productId).subscribe({
      next: (sizeList: any[]) => {
        this.sizes = sizeList.filter((s) => s.sizeId !== 0);
        this.buildAttributes();
      },
      error: (err) => console.error('取得 size 失敗', err),
    });
  }

  loadVariants() {
    if (!this.productId) return;
    this.productService.getProductVariants(this.productId).subscribe({
      next: (vars: any[]) => {
        this.productVariants = vars;
        this.thicknesses = this.extractDistinctOptions(
          vars.map((v) => v.thicknessId).filter((id) => id !== 0),
          (id) => this.getThicknessName(id)
        );
        this.genders = this.extractDistinctOptions(
          vars.map((v) => v.genderId).filter((id) => id !== 0),
          (id) => this.getGenderName(id)
        );
        this.buildAttributes();
      },
      error: (err) => console.error('取得 variants 失敗', err),
    });
  }

  private refreshReviewStats() {
    if (!this.productId) return;
    this.reviewService.getReviewStatsByProduct(this.productId).subscribe({
      next: (stats) => {
        this.avgRating = stats.avgRating;
        this.reviewCount = stats.reviewCount;
      },
      error: (err) => console.error('更新評分失敗', err),
    });
  }

  // ★ 小函式：用來產生一個 array，長度 = rating
  createStarsArray(rating: number): number[] {
    return Array.from({ length: rating }, (_, i) => i);
  }
  onReviewSubmit() {
    if (!this.user?.memberId) {
      this.alertService.error('尚未登入, 無法發表評論');

      return;
    }
    const payload = {
      memberId: this.user.memberId,
      memberName: this.user.memberName,
      productId: this.productId!,
      reviewRating: this.reviewForm.value.reviewRating,
      reviewContent: this.reviewForm.value.reviewContent,
    };
    if (this.editingReview) {
      // =========== 更新 ===============
      this.updateReview(payload);
    } else {
      // =========== 新增 ===============
      this.createReview(payload);
    }
  }

  editReview(r: TNreviewDTO) {
    this.editingReview = r;
    this.reviewForm.setValue({
      productId: r.productId,
      memberId: r.memberId,
      reviewRating: r.reviewRating,
      reviewContent: r.reviewContent,
    });
  }

  createReview(payload: any) {
    this.reviewService.addReview(payload).subscribe({
      next: (res: TNreviewDTO) => {
        this.alertService.success('評論新增成功');
        this.reviews.push(res);
        // ★ 新增完成後，重新計算星星 & 數量
        this.refreshReviewStats();
        // 清空表單
        this.reviewForm.reset();
      },
      error: (err) => {
        console.error(err);
        if (err.status === 403) {
          this.alertService.error('尚未購買過此商品，無法評價');
        } else if (
          err.status === 400 &&
          err.error === 'You already wrote a review for this product.'
        ) {
          this.alertService.error('已經對此商品留過評論!');
        } else {
          this.alertService.error('尚未購買過此商品，無法評價');
          // alert('發生錯誤: ' + err.message);
        }
      },
    });
  }
  updateReview(payload: any) {
    if (!this.editingReview) return;

    payload.reviewId = this.editingReview.reviewId;
    this.http
      .put(
        `https://localhost:7107/api/TNreviews/${this.editingReview.reviewId}`,
        payload
      )
      .subscribe({
        next: (res) => {
          this.alertService.success('評論修改成功');
          // 1) 找到對應的評論，更新內容
          const index = this.reviews.findIndex(
            (r) => r.reviewId === this.editingReview!.reviewId
          );
          if (index > -1) {
            this.reviews[index].reviewRating = payload.reviewRating;
            this.reviews[index].reviewContent = payload.reviewContent;
          }

          // 2) 重新計算平均評分 & 評論數
          this.refreshReviewStats();

          // 3) 重置表單與狀態
          this.reviewForm.reset();
          this.editingReview = null;
        },
        error: (err) => {
          console.error(err);
          if (err.status === 403) {
            this.alertService.error('您無法修改評論');
          } else {
            this.alertService.error('您無法修改失敗');
          }
        },
      });
  }
  removeReview(reviewId: number) {
    if (!confirm('確定要刪除這則評論嗎？')) return;
    const memberId = this.user?.memberId;

    this.http
      .delete(`https://localhost:7107/api/TNreviews/${reviewId}`, {
        body: { memberId: memberId },
      })
      .subscribe({
        next: (res) => {
          this.alertService.success('評論刪除成功');
          // 1) 從本機 reviews 陣列中移除
          this.reviews = this.reviews.filter((r) => r.reviewId !== reviewId);

          // 2) 重新計算平均評分 & 評論數
          this.refreshReviewStats();
        },
        error: (err) => {
          console.error(err);
          this.alertService.error('刪除評論失敗');
        },
      });
  }
  onStarClick(star: number, event: MouseEvent) {
    event.preventDefault(); // 阻止 <a> 預設跳轉
    // 用 patchValue() 或 setValue() 來更新表單控制
    this.reviewForm?.patchValue({ reviewRating: star });
    console.log('選到星星=', star, ',表單值=', this.reviewForm?.value);
  }

  buildAttributes() {
    // 注意要先確保 this.colors, this.sizes ... 都有值
    this.attributes = [
      {
        label: 'Color',
        values: this.colors.map((c) => this.parseRgbToName(c.color)),
      },
      { label: 'Size', values: this.sizes.map((s) => s.size) },
      { label: 'Thickness', values: this.thicknesses.map((t) => t.name) },
      { label: 'Gender', values: this.genders.map((g) => g.name) },
    ].filter((attr) => attr.values.length > 0); // 過濾空的
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
    this.onVariantChange();
    // do something
    console.log('選擇color=', c.colorId);
  }

  onSizeClick(s: SizeDTO) {
    if (!s.hasStock) {
      return;
    }
    this.selectedSize = s.sizeId;
    this.onVariantChange();
  }

  onThicknessClick(t: { id: number; name: string }) {
    this.selectedThickness = t.id;
    this.onVariantChange();
  }

  onGenderClick(g: { id: number; name: string }) {
    this.selectedGender = g.id;
    this.onVariantChange();
  }

  /** 若你仍想前端找到 selectedVariant, 可保留 */
  onVariantChange() {
    // 假設商品有 color, size, thickness, gender 的組合
    const needColor = this.colors.length > 0;
    const needSize = this.sizes.length > 0;
    const needThick = this.thicknesses.length > 0;
    const needGender = this.genders.length > 0;

    // 若需要而沒選，暫時不顯示
    if (needColor && !this.selectedColor) {
      this.selectedVariant = null;
      return;
    }
    if (needSize && !this.selectedSize) {
      this.selectedVariant = null;
      return;
    }
    if (needThick && !this.selectedThickness) {
      this.selectedVariant = null;
      return;
    }
    if (needGender && !this.selectedGender) {
      this.selectedVariant = null;
      return;
    }

    this.selectedVariant =
      this.productVariants.find(
        (v) =>
          (needColor ? v.colorId === this.selectedColor : true) &&
          (needSize ? v.sizeId === this.selectedSize : true) &&
          (needThick ? v.thicknessId === this.selectedThickness : true) &&
          (needGender ? v.genderId === this.selectedGender : true)
      ) || null;
  }

  /** 使用 ngx-lightbox 顯示大圖 */
  openLightbox(index: number): void {
    this.lightbox.open(this.album, index);
    console.log('album=', this.album);
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
      // alert('商品資料尚未載入');
      return;
    }

    // ============ 動態檢查四個變體 =============

    // (A) 若前端顯示 color (this.colors.length > 0)，就要檢查是否 user 已選 color
    if (this.colors.length > 0 && !this.selectedColor) {
      this.alertService.error('請先選擇顏色');
      return;
    }

    // (B) 若前端顯示 size (this.sizes.length > 0)，就要檢查是否 user 已選 size
    if (this.sizes.length > 0 && !this.selectedSize) {
      this.alertService.error('請先選擇尺寸');
      return;
    }

    // (C) 若前端顯示 thickness (this.thicknesses.length > 0)，就要檢查是否 user 已選 thickness
    if (this.thicknesses.length > 0 && !this.selectedThickness) {
      this.alertService.error('請先選擇厚度');
      return;
    }

    // (D) 若前端顯示 gender (this.genders.length > 0)，就要檢查是否 user 已選 gender
    if (this.genders.length > 0 && !this.selectedGender) {
      this.alertService.error('請先選擇款式');
      return;
    }
    //確認抓到正確的memberId
    const realMemberId = this.user?.memberId;

    if (!realMemberId) {
      // 引導使用者登入
      this.alertService.error('請先登入再加入購物車');
      console.log('realMemberId', realMemberId);
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
      memberId: realMemberId,
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
              productName: this.productDetail?.productName ?? '', // or fallback to this.productDetail?.productName
              uproductId: res.uproductId ?? null,
              quantity: payload.quantity,
              unitpriceatCart: this.discountedPrice!,
              imageUrl: res.imageUrl,
              isLocked: false,
              condition: 'new',
              creationDate: new Date().toISOString(),
              updatedDate: new Date().toISOString(),

              color: res.colorName,
              size: res.sizeName,
              thickness: res.thicknessName,
              gender: res.genderName,
              stock: 0,
            };
            console.log('後端回傳:', res);
            this.cartItemsService.addToCart(newItem);
            this.sharedcartService.openCartPanel();

            // alert('加入購物車成功(後端已檢查庫存)!');
          } else {
            // alert(res.message || '無法加入購物車');
          }
        },
        error: (err) => {
          console.error('加入購物車失敗:', err);
          // alert('系統異常，無法加入購物車');
        },
      });
  }

  /** 離開頁面 => 紀錄停留時間 */
  ngOnDestroy(): void {
    const dwellSeconds = Math.floor((Date.now() - this.enterTime) / 1000);
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
  //color rgb換成文字
  private rgbToNameMap: Record<string, string> = {
    'rgb(56, 124, 220)': '藍色',
    'rgb(0, 0, 0)': '黑色',
    'rgb(234, 234, 234)': '白色',
    'rgb(246, 0, 123)': '紅色',
  };

  private parseRgbToName(rgb: string): string {
    // 如果有在 map 裡，就回傳對應的名稱；否則就直接回傳原字串
    return this.rgbToNameMap[rgb] || rgb;
  }
}
