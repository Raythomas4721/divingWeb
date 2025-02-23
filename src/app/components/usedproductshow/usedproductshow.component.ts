import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { ProductsService } from '../../services/products.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TUcategory, TUcreateproductDTO, TUproductDTO, TUcondition } from 'src/app/interface/TUproductDTO';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-usedproductshow',
  templateUrl: './usedproductshow.component.html',
  styleUrls: ['./usedproductshow.component.css']
})
export class UsedproductshowComponent implements OnInit {
  user?: UserDTO | null;
  usedProducts: TUcreateproductDTO[] = [];
  usedCategory: TUcategory[] = [];
  usedCondition: TUcondition[] = [];
  isLoading = true; // 用來顯示載入狀態
  // 用來儲存圖片預覽的 Base64 字串
  previewUrls: string[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    // 利用 @ViewChild 觸發選擇檔案
    triggerFileSelect(): void {
      this.fileInput.nativeElement.click();
    }
  UPForm = new FormGroup({
    categoryId: new FormControl(),
    productName: new FormControl(),
    productDescription: new FormControl(),
    productPrice: new FormControl(),
    productConditionId: new FormControl(),
    tUproductImages: new FormControl(),
  })


  constructor(
    private productsService: ProductsService,
    private authService: AuthService
  ) { }

  // 必須要有 ngOnInit 方法
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
    this.loadCondition();
  }
  loadUsedProducts(): void {
    this.productsService.getUsedProducts().subscribe({
      next: (data: TUcreateproductDTO[]) => {
        this.usedProducts = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('載入二手商品失敗:', error);
        this.isLoading = false;
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
  loadCondition() {
    this.productsService.getUsedCondition().subscribe({
      next: (data: TUcondition[]) => {
        this.usedCondition = data;
        console.log('condition', this.usedCondition);
      }
    })
  }
    // 表單送出時的動作
    onSubmit(): void {
      if (this.UPForm.invalid) {
        console.warn("請填寫完整商品資訊");
        return;
      }

      const formData = this.UPForm.value;
      // 準備符合 DTO 格式的商品資料
      const newProduct: TUcreateproductDTO = {
        categoryId: formData.categoryId!,
        productName: formData.productName!,
        productDescription: formData.productDescription!,
        productPrice: formData.productPrice!,
        productConditionId: formData.productConditionId!,
        tUproductImages: formData.tUproductImages! // 圖片為 Base64 陣列
      };

      // 呼叫 service 來儲存商品
      this.productsService.createUsedProduct(newProduct).subscribe({
        next: (response) => {
          console.log("商品上架成功:", response);
          alert("商品已成功上架！");
        },
        error: (error) => {
          console.error("商品上架失敗:", error);
          alert("商品上架失敗，請稍後再試！");
        }
      });
    }
  // 當選擇圖片時觸發
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    // 清空先前的預覽（若需要）
    this.previewUrls = [];

    // 遍歷所有選取的檔案
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // 將讀取結果（Base64 字串）加入 previewUrls 陣列
        this.previewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }
  // removeImage(productIndex: number, imageIndex: number): void {
  //   this.usedProducts[productIndex].tUproductImages.splice(imageIndex, 1);
  // }
  removeImage(index: number): void {
    this.previewUrls.splice(index, 1);
  }
}
