import { SharedcartService } from './../../services/sharedcart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { TNcartItemsService } from './../../services/tncart-items.service';
import { Component, OnInit } from '@angular/core';
import {
  ColorDTO,
  SizeDTO,
  TNproductDTO,
  TNprovariantDTO,
} from 'src/app/interface/TNproductDTO';
import { TnproductService } from './../../services/tnproduct.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-shopproductshow',
  templateUrl: './shopproductshow.component.html',
  styleUrls: ['./shopproductshow.component.css'],
})
export class ShopproductshowComponent implements OnInit {
  // 圖片相簿
  album: Array<{ src: string; caption?: string; thumb?: string }> = [];

  productId: number | null = null;
  productDetail: TNproductDTO | null = null;

  // 從後端取得的變體清單 (主要用來找 thickness/gender => 可視需求保留)
  productVariants: TNprovariantDTO[] = [];

  // 從後端 API (colors?productId=xxx) / (sizes?productId=xxx) 取得
  colors: ColorDTO[] = [];
  sizes: SizeDTO[] = [];

  thicknesses: Array<{ id: number; name: string }> = [];
  genders: Array<{ id: number; name: string }> = [];

  // 選擇的 color / size / thickness / gender
  selectedColor: number | null = null;
  selectedSize: number | null = null;
  selectedThickness: number | null = null;
  selectedGender: number | null = null;

  selectedVariant: TNprovariantDTO | null = null;
  quantity = 1;

  // Modal 相關
  isModalOpen = false;
  selectedImage = '';

  constructor(
    private route: ActivatedRoute,
    private productService: TnproductService,
    private cartItemsService: TNcartItemsService,
    private http: HttpClient,
    private router: Router,
    private sharedcartService: SharedcartService
  ) {}

  ngOnInit() {
    // 1) 取得路由參數
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.productId) {
      console.error('無法取得商品ID');
      return;
    }

    // 2) 取得單一商品詳細
    this.productService.getSingleProduct(this.productId).subscribe({
      next: (res) => {
        this.productDetail = res;
        console.log('單一商品: ', this.productDetail);

        // 如果有 imageUrl 就放到 album
        if (this.productDetail.imageUrl && this.productDetail.imageUrl.length) {
          for (const filename of this.productDetail.imageUrl) {
            const fullPath = 'assets/images/shop/' + filename;
            this.album.push({
              src: fullPath,
              caption: filename,
              thumb: fullPath,
            });
          }
        }
      },
      error: (err) => {
        console.error('取得單一商品失敗', err);
      },
    });

    // 3) 從後端拿 color / size (含 hasStock)
    //   這樣就不用透過 productVariants 來做 distinct
    this.productService.getColorsForProduct(this.productId).subscribe({
      next: (colorList) => {
        this.colors = colorList.filter((c) => c.colorId !== 0);
        console.log('Colors =>', this.colors);
      },
      error: (err) => console.error('取得顏色清單失敗', err),
    });

    this.productService.getSizesForProduct(this.productId).subscribe({
      next: (sizeList) => {
        this.sizes = sizeList.filter((s) => s.sizeId !== 0);
        console.log('Sizes =>', this.sizes);
      },
      error: (err) => console.error('取得尺寸清單失敗', err),
    });

    // 4) 仍需 productVariants 來決定 thickness, gender ？(視需求)
    this.productService.getProductVariants(this.productId).subscribe({
      next: (variants) => {
        this.productVariants = variants;
        console.log('變體清單: ', this.productVariants);

        // thickness
        this.thicknesses = this.extractDistinctOptions(
          variants.map((v) => v.thicknessId).filter((tid) => tid !== 0),
          (id) => this.getThicknessName(id)
        );
        // gender
        this.genders = this.extractDistinctOptions(
          variants.map((v) => v.genderId).filter((tid) => tid !== 0),
          (id) => this.getGenderName(id)
        );

        // 若需要預設：可取第一筆
        if (variants.length > 0) {
          const first = variants[0];
          // 先不設定 color/size => 由 user 自行點選
          this.selectedThickness = first.thicknessId;
          this.selectedGender = first.genderId;
          this.selectedVariant = first;
        }
      },
      error: (err) => {
        console.error('取得變體資料失敗', err);
      },
    });
  }

  /** 當使用者點擊「顏色」時 */
  onColorClick(c: ColorDTO) {
    if (!c.hasStock) {
      return; // 無庫存就跳過
    }
    this.selectedColor = c.colorId;
    this.onVariantChange();
  }

  /** 當使用者點擊「尺寸」時 */
  onSizeClick(s: SizeDTO) {
    if (!s.hasStock) {
      return;
    }
    this.selectedSize = s.sizeId;
    this.onVariantChange();
  }

  onThicknessClick(t: { id: number; name: string }) {
    this.selectedThickness = t.id; // 設為當前選擇
    this.onVariantChange(); // 重新匹配 variant
  }
  onGenderClick(g: { id: number; name: string }) {
    this.selectedGender = g.id;
    this.onVariantChange();
  }
  /**
   * 當 thickness / gender 變動時 (如果也想用點選方式則自行改)
   * 目前是 template `<select>` or something
   */
  onVariantChange(): void {
    if (!this.productVariants.length) return;

    this.selectedVariant =
      this.productVariants.find(
        (v) =>
          v.colorId === this.selectedColor &&
          v.sizeId === this.selectedSize &&
          v.thicknessId === this.selectedThickness &&
          v.genderId === this.selectedGender
      ) ?? null;
  }

  /** 加入購物車 */
  onConfirmAddToCart(): void {
    if (!this.productDetail) {
      console.warn('尚未載入商品資料');
      return;
    }

    const newItem: TNcartItemDTO = {
      memberId: 1,
      productName: this.productDetail.productName,
      uproductId: this.productDetail.productId,
      productvariantsId: this.selectedVariant
        ? this.selectedVariant.productvariantsId
        : null,
      quantity: this.quantity,
      unitpriceatCart: this.productDetail.unitPrice,
      imageUrl: this.productDetail.imageUrl,
      isLocked: false,
      condition: 'new',
      creationDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    // 1. 加進 CartService
    this.cartItemsService.addToCart(newItem);

    // 2. 打開 SideCart
    this.sharedcartService.openCartPanel();
  }

  /** 將 ID map 成顯示名稱 (thickness/gender) */
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

  /** 從陣列 distinct ID -> {id, name} */
  private extractDistinctOptions(
    ids: number[],
    getName: (id: number) => string
  ): Array<{ id: number; name: string }> {
    const filtered = ids.filter((id) => id !== 0); // <-- 在這裡也可以先排除 0
    const uniqueIds = Array.from(new Set(filtered));
    return uniqueIds.map((id) => ({
      id,
      name: getName(id),
    }));
  }

  /** 是否有第二版本檔名 (例如 M_....) */
  hasSecondVersion(filename: string): boolean {
    return filename.startsWith('M');
  }

  /** 圖片 Modal */
  openModal(imageUrl: string) {
    console.log('openModal() triggered, imgUrl =', imageUrl);
    this.selectedImage = imageUrl;
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }
}
