import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { ProductsService } from '../../services/products.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TUproductDTO, TUcategory } from 'src/app/interface/TUproductDTO';
import { FormControl, FormGroup } from '@angular/forms';
//購物車
import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { TNcartItemsService } from './../../services/tncart-items.service';
import { SharedcartService } from './../../services/sharedcart.service';
import { HttpClient } from '@angular/common/http';
import {
  TNproductDTO,
  TNprovariantDTO,
  ColorDTO,
  SizeDTO,
} from 'src/app/interface/TNproductDTO';
@Component({
  selector: 'app-used-products',
  templateUrl: './used-products.component.html',
  styleUrls: ['./used-products.component.css']
})
export class UsedProductsComponent {

  user?: UserDTO | null;
  Products: TUproductDTO[] = [];
  usedProducts: any[] = [];
  usedCategory: TUcategory[] = [];
  selectedProducts: number[] = [];
  filteredProducts: any[] = [];
  searchKeyword: string = '';
  isAllSelected: boolean = false;
  pageSize: number = 8;
  page: number[] = [];
  categoryId: number | null = null;
  UPForm = new FormGroup({
    categoryId: new FormControl(),
    productName: new FormControl(),
    productDescription: new FormControl(),
    productPrice: new FormControl(),
    productConditionId: new FormControl(),
    ductConditionId: new FormControl()
  })

  //購物車
  productDetail: TNproductDTO | null = null;
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
    productId: number | null = null;
    quantity = 1; // 使用者輸入的購買數量
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private productsService: ProductsService,
    private router: Router,
    private http: HttpClient,
    private cartItemsService: TNcartItemsService,
    private sharedcartService: SharedcartService
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user?.user;
      if (user) {
        console.log("用戶資料已載入:", this.user);
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
        //console.log('test', data);
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

  loadUsedProductsTest(categoryId: number | null): void {
    console.log('click!', categoryId);
    this.productsService.getUsedProducts(1, 8, categoryId).subscribe({
      next: (data: any[]) => {
        console.log('test', data);
        this.usedProducts = data;
        this.filteredProducts = [...this.usedProducts];
      },
      error: (error: HttpErrorResponse) => {
        console.error('載入二手商品失敗:', error);
      }
    });
  }
  loadCategory() {
    this.productsService.getUsedCategory().subscribe({
      next: (data: TUcategory[]) => {
        this.usedCategory = data;
        //console.log('categories', this.usedCategory);
      }
    })
  }

  searchProducts(): void {
    this.isAllSelected = false;
    if (this.searchKeyword.trim() !== '') {
      this.filteredProducts = this.usedProducts.filter(p =>
        p.productName.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    } else {
      this.filteredProducts = [...this.usedProducts];
    }
  }

  // deleteProduct(productId: number): void {
  //   if (confirm('確定要刪除這個商品嗎?')) {
  //     this.productsService.deleteProduct(productId).subscribe({
  //       next: (response: { message: any; }) => {
  //         alert(response.message);
  //         this.loadUsedProducts();
  //       },
  //       error: (error: HttpErrorResponse) => {
  //         console.error('刪除商品失敗:', error);
  //         alert(error.error.message || '刪除失敗!');
  //       }
  //     });
  //   }
  // }

  toggleSelectAll(event: Event): void {
    this.isAllSelected = (event.target as HTMLInputElement).checked;
    this.filteredProducts.forEach(product => product.selected = this.isAllSelected);
  }

  updateSelectAllStatus(): void {
    this.isAllSelected = this.filteredProducts.every(product => product.selected);
  }

  getSelectedProductIds(): number[] {
    return this.filteredProducts.filter(product => product.selected).map(product => product.productId);
  }

  logSelectedProducts(): void {
    console.log(this.getSelectedProductIds());
  }
  checkSellAccess(): void {
    if (this.authService.isLoggedIn$) {
      // 若已登入，導向出售頁面
      this.router.navigate(['/usedproductshow']);
    } else {
      // 若未登入，顯示提示或開啟登入彈跳視窗
      alert('請先登入會員再進行出售！');
      // 你也可以導向登入頁面
      // this.router.navigate(['/login']);
    }
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
      //確認抓到正確的memberId
      const realMemberId = this.user?.memberId;

      if (!realMemberId) {
        // 引導使用者登入
        alert('請先登入再加入購物車');
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
                unitpriceatCart: res.price,
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
              alert(res.message || '無法加入購物車');
            }
          },
          error: (err) => {
            console.error('加入購物車失敗:', err);
            alert('系統異常，無法加入購物車');
          },
        });
    }
}

