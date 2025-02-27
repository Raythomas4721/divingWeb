import { ModalService } from 'src/app/services/modal.service';
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
import { debounceTime } from 'rxjs/operators';

//購物車
import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { TNcartItemsService } from './../../services/tncart-items.service';
import { SharedcartService } from './../../services/sharedcart.service';
import { HttpClient } from '@angular/common/http';
import { TNprovariantDTO } from 'src/app/interface/TNproductDTO';
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
  // searchKeyword = new FormControl(''); // 使用 FormControl 來處理輸入變化
  productId: number | null = null;
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
  // productDetail: TNproductDTO | null = null;
  productDetail: TUproductDTO | null = null;

  // 使用者選擇的變體
  selectedColor: number | null = null;
  selectedSize: number | null = null;
  selectedThickness: number | null = null;
  selectedGender: number | null = null;
  selectedVariant: TNprovariantDTO | null = null;

  quantity = 1; // 使用者輸入的購買數量
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private productsService: ProductsService,
    private router: Router,
    private http: HttpClient,
    private cartItemsService: TNcartItemsService,
    private sharedcartService: SharedcartService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.getUser();
    this.loadUsedProducts();
    this.loadCategory();
  }

  private getUser() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        console.log("用戶資料已載入:", this.user);
      } else {
        console.log("等待 API 返回，用戶資料尚未載入");
      }
    });
  }

  loadUsedProducts(): void {
    this.productsService.getUsedProducts(1, 8, this.categoryId).subscribe({
      next: (data: any[]) => {
        console.log('test', data);
        this.usedProducts = data;

        //console.log('usedProducts:', data);
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
  //1
  // searchProducts(): void {
  //   this.isAllSelected = false;
  //   if (this.searchKeyword.trim() !== '') {
  //     this.filteredProducts = this.usedProducts.filter(p =>
  //       p.productName.toLowerCase().includes(this.searchKeyword.toLowerCase())
  //     );
  //   } else {
  //     this.filteredProducts = [...this.usedProducts];
  //   }
  // }
  //2
  // searchProducts(keyword: string): void {
  //   const lowerKeyword = keyword.toLowerCase().trim();

  //   if (lowerKeyword === '') {
  //     this.filteredProducts = [...this.usedProducts]; // 恢復所有商品
  //   } else {
  //     this.filteredProducts = this.usedProducts.filter(product =>
  //       product.productName.toLowerCase().includes(lowerKeyword) ||
  //       product.categoryName?.toLowerCase().includes(lowerKeyword) // 搜尋類別
  //     );
  //   }
  // }
  searchProducts(): void {
    const lowerKeyword = this.searchKeyword.toLowerCase().trim();
    this.isAllSelected = false;

    this.productsService.getUsedProducts(1, 8, this.categoryId, lowerKeyword).subscribe({
      next: (data: TUproductDTO[]) => {
        this.usedProducts = data;
        console.log('搜尋結果:', this.usedProducts);
      },
      error: (error: HttpErrorResponse) => {
        console.error('搜尋商品失敗:', error);
      }
    });
  }


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

  openModalLogin(): void {
    // this.modalService.showLoginModal();
    if (this.user) {
      this.router.navigate(['/usedproductshow'])
    }
    else {
      this.modalService.showLoginModal();
    }
  }

  readProductId(productIdSelected: number) {
    console.log(productIdSelected);
  }

  /** 最終 => 呼叫後端 addCart API 做庫存檢查+加購物車 */
  onConfirmAddToCart(productIdSelected: number) {
    // 1) 若 productDetail 還沒載入
    // if (!this.productDetail) {
    //   alert('商品資料尚未載入');
    //   return;
    // }

    //把按的ID塞到變數內
    this.productId = productIdSelected;
    //確認抓到正確的memberId
    const realMemberId = this.user?.memberId;
    console.log('realMemberId:', realMemberId);
    if (!realMemberId) {
      // 引導使用者登入
      alert('請先登入再加入購物車');
      console.log('realMemberId', realMemberId);
      return;
    }

    // 2) 組合要傳給後端的 payload
    const payload = {
      productId: this.productId,
      quantity: 1,
      memberId: realMemberId,
    };
    console.log('將要傳給後端的 payload:', payload);

    // 3) 呼叫後端 /api/TNproductvariants/addCart
    this.http
      .post('https://localhost:7107/api/TUproductsAPI/addCart', payload)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            // 前端更新暫存購物車 + 開panel
            const newItem: TNcartItemDTO = {
              memberId: payload.memberId,
              productName: this.productDetail?.productName ?? '', // or fallback to this.productDetail?.productName
              uproductId: res.uproductId ?? null,
              quantity: payload.quantity,
              unitpriceatCart: res.price,
              imageUrl: res.imageUrl,
              isLocked: false,
              condition: 'used',
              creationDate: new Date().toISOString(),
              updatedDate: new Date().toISOString(),

              stock: 0,
            };
            console.log('後端回傳:', res);
            //this.cartItemsService.addToCart(newItem);
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

