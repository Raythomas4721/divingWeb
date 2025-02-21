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
  pages: number[] = [];

  UPForm = new FormGroup({
    categoryId: new FormControl(),
    productName: new FormControl(),
    productDescription: new FormControl(),
    productPrice: new FormControl(),
    productConditionId: new FormControl()
  })

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private productsService: ProductsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user?.user;
      if (user) {
        console.log("用戶資料已載入:", this.user);
        this.loadUsedProducts();
      } else {
        console.log("等待 API 返回，用戶資料尚未載入");
      }
    });
    this.loadUsedProducts();
    this.loadCategory();
  }

  loadUsedProducts(): void {
    this.productsService.getUsedProducts().subscribe({
      next: (data: any[]) => {
        this.usedProducts = data;
        console.log(data);

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
  loadCategory() {
    this.productsService.getUsedCategory().subscribe({
      next: (data: TUcategory[]) => {
        this.usedCategory = data;
        console.log('categories', this.usedCategory);
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
}

