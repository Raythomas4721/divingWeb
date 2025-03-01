import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { ProductsService } from '../../services/products.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TUcategory, TUcreateproductDTO, TUproductDTO, TUcondition } from 'src/app/interface/TUproductDTO';
import { FormBuilder,Validators,FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-usedproductshow',
  templateUrl: './usedproductshow.component.html',
  styleUrls: ['./usedproductshow.component.css']
})
export class UsedproductshowComponent implements OnInit {
  user?: UserDTO | null;
  sellerId?: UserDTO | null;
  usedProducts: TUcreateproductDTO[] = [];
  usedCategory: TUcategory[] = [];
  usedCondition: TUcondition[] = [];
  showImageError = false; // 控制圖片錯誤訊息顯示
  //
  imagePreviews: string[] = [];
  draggedIndex: number | null = null;
  selectedImages: File[] = [];
  maxImages: number = 6;
  isSubmitting = false;
  isLoading = true; // 用來顯示載入狀態
  // 用來儲存圖片預覽的 Base64 字串
  // previewUrls: string[] = [];
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
    productStatus: new FormControl(true), // 新增此控制項
    tUproductImages: new FormControl(''),
  })


  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private authService: AuthService,
    private router: Router // 加入 Router 來做導向
  ) {this.UPForm = this.fb.group({
    categoryId: ['', Validators.required],
    productName: ['', Validators.required], // 商品名稱必填
    productDescription: ['', Validators.required], // 商品描述必填
    productPrice: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]], // 價格必填且需為數字
    productConditionId: ['', Validators.required],
    productStatus: [true],
    tUproductImages: [''],
  });

    }

  // 必須要有 ngOnInit 方法
  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        console.log("用戶資料已載入:", this.user);
        this.loadUsedProducts();
      } else {
        console.log("等待 API 返回，用戶資料尚未載入");
      }
    });
    // this.loadUsedProducts();
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

    if (!this.user || !this.user.memberId) {
      alert("請先登入後再進行商品上架！");
      return;
    }
    if (this.UPForm.invalid) {
      // console.warn("請填寫完整商品資訊");
      this.UPForm.markAllAsTouched(); // 這行確保所有未填的欄位會觸發錯誤訊息
    //alert("請填寫完整商品資訊！");
      return;
    }

  // 確保至少上傳一張圖片
  if (this.imagePreviews.length === 0) {
    alert("請至少新增一張圖片！");
    return;
  }
  if (this.isSubmitting) return; // 防止多次提交
  this.isSubmitting = true;

    // 移除圖片 Base64 的前綴
    const imagesWithoutPrefix = this.imagePreviews.map(url =>
      url.includes('base64,') ? url.split('base64,')[1] : url
    );
    const formData = this.UPForm.value;
    // 準備符合 DTO 格式的商品資料
    const newProduct: TUcreateproductDTO = {
      sellerId: this.user!.memberId, // 這裡需要確保 user 資料存在
      categoryId: formData.categoryId!,
      productName: formData.productName!,
      productDescription: formData.productDescription!,
      productPrice: formData.productPrice!,
      productConditionId: formData.productConditionId!,
      productStatus: true, // 假設狀態為 "available"，可根據需求調整
      // tUproductImages: formData.tUproductImages! // 圖片為 Base64 陣列
      tUproductImages: imagesWithoutPrefix   // 確保圖片為 Base64 字串陣列
    };

    // 呼叫 service 來儲存商品
    this.productsService.createUsedProduct(newProduct).subscribe({
      next: (response) => {
        // console.log("商品上架成功:", response);
        alert("商品已成功上架！");
        this.isSubmitting = false; // 重置狀態
      this.router.navigate(['/used-products']); // 上架成功後導向商品列表頁
      },
      error: (error) => {
        // console.error("商品上架失敗:", error);
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
    this.imagePreviews = [];

    // 遍歷所有選取的檔案
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // 將讀取結果（Base64 字串）加入 previewUrls 陣列
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // 移除圖片
  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      if (event.dataTransfer.files.length + this.imagePreviews.length > this.maxImages) {

      }
      this.handleImageUpload(event.dataTransfer.files);
    }
  }
  onImageSelected(event: any): void {
    const files: FileList = event.target.files; //取得使用者選擇的圖片
    //上傳+已存在的圖片不可超出最大上限
    if (files.length + this.imagePreviews.length > this.maxImages) {
      return;
    }
    this.handleImageUpload(files);
  }
  handleImageUpload(files: FileList): void {
    Array.from(files).forEach(file => {
      if (this.imagePreviews.length < this.maxImages) {
        this.selectedImages.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string);
          console.log("目前預覽圖片:", this.imagePreviews);
        };
        reader.readAsDataURL(file);
      }
    });
  }
  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index; // 記錄被拖曳的圖片索引
    event.dataTransfer?.setData('text/plain', index.toString());  // 將索引存入拖曳數據
  }

  onDragOverImage(event: DragEvent): void {
    event.preventDefault();
  }

  onDropImage(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    if (this.draggedIndex === null || this.draggedIndex === dropIndex) return;

    // 交換圖片預覽
    const draggedImage = this.imagePreviews[this.draggedIndex];
    this.imagePreviews.splice(this.draggedIndex, 1);
    this.imagePreviews.splice(dropIndex, 0, draggedImage);

    // 交換對應的檔案
    if (this.selectedImages[this.draggedIndex] instanceof File) {
      const draggedFile = this.selectedImages[this.draggedIndex];
      this.selectedImages.splice(this.draggedIndex, 1);
      this.selectedImages.splice(dropIndex, 0, draggedFile);
    }

    // 確保 selectedImages 仍然是有效的 File 陣列
    this.selectedImages = this.selectedImages.filter(file => file instanceof File);

    this.draggedIndex = null;
  }
  autoFillForm(): void {
    this.UPForm.patchValue({
      productName: '全罩式浮潛面罩',
      productDescription: '高品質全罩式浮潛面罩，適合各種水域活動，防霧防漏設計。',
      productPrice: '1499',
      categoryId: this.usedCategory.length > 0 ? this.usedCategory[0].categoryId : '', // 選擇第一個分類
      productConditionId: this.usedCondition.length > 0 ? this.usedCondition[0].productConditionId : '' // 選擇第一個商品狀況
    });

    // 預設圖片 (Base64 或 URL)
    const defaultBase64Images = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAA...', // 這裡填入完整的 Base64 字串
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAA...'
    ];

    this.imagePreviews = defaultBase64Images;
    this.showImageError = false; // 隱藏錯誤提示
  }


}
