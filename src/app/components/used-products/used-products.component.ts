import { OnInit } from '@angular/core';
// import { Component } from '@angular/core';
// import { UserDTO } from 'src/app/interface/userDTO';
// import { AuthService } from 'src/app/services/auth.service';
// import { UserService } from 'src/app/services/user.service';

// @Component({
//   selector: 'app-used-products',
//   templateUrl: './used-products.component.html',
//   styleUrls: ['./used-products.component.css']

// })
// export class UsedProductsComponent {
//   constructor(private authService: AuthService, private userService: UserService) { }

//   user?: UserDTO | null;
//   ngOnInit(): void {
//     this.authService.user$.subscribe(user => {
//       this.user = user?.user;
//       if (user) {
//         console.log("用戶資料已載入:", this.user);
//       } else {
//         console.log("等待 API 返回，用戶資料尚未載入");
//       }
//     });
//   }

// }
import { Component } from '@angular/core';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { ProductsService } from '../../services/products.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TUproductDTO } from 'src/app/interface/TUproductDTO';
import { ModalService } from 'src/app/services/modal.service';


@Component({
  selector: 'app-used-products',
  templateUrl: './used-products.component.html',
  styleUrls: ['./used-products.component.css']

})
export class UsedProductsComponent {

  user?: UserDTO | null;
  Products: TUproductDTO[] = [];
  usedProducts: any[] = [];
  selectedProducts: number[] = [];
  filteredProducts: any[] = [];
  searchKeyword: string = '';
  isAllSelected: boolean = false;
  pageSize: number = 6;
  pages: number[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private productsService: ProductsService,
    private router: Router,
    private modalService: ModalService
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
  }

  loadUsedProducts(): void {
    this.productsService.getUsedProducts().subscribe({
      next: (data: any[]) => {
        this.usedProducts = data;

        this.filteredProducts = [...this.usedProducts];
        console.log(this.filteredProducts);
      },
      error: (error: HttpErrorResponse) => {
        console.error('載入二手商品失敗:', error);
        // alert('請先登入會員!');
        // this.router.navigate(['user/login']);
      }
    });
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

  deleteProduct(productId: number): void {
    if (confirm('確定要刪除這個商品嗎?')) {
      this.productsService.deleteProduct(productId).subscribe({
        next: (response: { message: any; }) => {
          alert(response.message);
          this.loadUsedProducts();
        },
        error: (error: HttpErrorResponse) => {
          console.error('刪除商品失敗:', error);
          alert(error.error.message || '刪除失敗!');
        }
      });
    }
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

  openModalLogin(): void {
    this.modalService.showLoginModal();
  }
}

