import { SharedcartService } from './../../services/sharedcart.service';
import { Component } from '@angular/core';
import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { TNcartItemsService } from '../../services/tncart-items.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserDTO } from 'src/app/interface/userDTO';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-side-cart',
  templateUrl: './side-cart.component.html',
  styleUrls: ['./side-cart.component.css'],
})
export class Sideshopcart {
  cartItems: TNcartItemDTO[] = [];
  isCartVisible = false;

  // 優惠碼、促銷或錯誤相關
  couponCode = '';
  hasError = false;
  user?: UserDTO | null;
  subTotal: number = 0;
  total: number = 0;

  constructor(
    private cartItemsService: TNcartItemsService,
    private sharedcartService: SharedcartService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cartItemsService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      this.updateTotals();
      this.checkForErrors(); // 檢查是否有缺貨或其他錯誤
    });
    // 監聽 openCart$，一旦有人呼叫 openCartPanel()，就執行 openCart()
    this.sharedcartService.openCart$.subscribe(() => {
      this.openCart();
    });
    // 監聽使用者資訊
    this.authService.user$.subscribe((u) => {
      this.user = u;
    });
  }
  openCart() {
    this.isCartVisible = true;
  }

  closeCart() {
    this.isCartVisible = false;
  }
  // 簡單示範：移除單一商品
  removeItem(variantId: number, memberId?: number) {
    this.cartItemsService.removeItem(variantId, memberId).subscribe({
      next: (res) => {
        console.log('刪除成功', res);
        // 如果想用成功通知：
        this.alertService.success('已刪除該商品');
      },
      error: (err) => {
        console.error('刪除失敗', err);
        this.alertService.error('刪除商品失敗');
      },
    });
  }

  // 點擊 Update cart
  updateCart() {
    console.log('Update cart!');
    // ...實作
    // 也可在這個方法中呼叫 this.updateTotals();
  }
  // 計算小計/總計 (可再做運費、折扣等)
  updateTotals() {
    this.subTotal = this.cartItems.reduce(
      (acc, item) => acc + item.unitpriceatCart * item.quantity,
      0
    );
    // 若無額外費用，subTotal = total
    this.total = this.subTotal;
  }
  // 點擊 Coupon
  applyCoupon() {
    console.log('Apply coupon:', this.couponCode);
    // ...實作
  }
  proceedToCheckout() {
    if (this.hasError) {
      console.log('無法進行結帳，購物車存在缺貨或錯誤');
      this.alertService.error('無法結帳：有缺貨商品或其他錯誤');
      return;
    }

    // 1) 組合 payload
    // 如果需要收件地址 / 電話 / 付款方式，可在 side cart 另做輸入
    const payload = {
      memberId: this.user?.memberId,
      paymentMethod: 'CreditCard',
      shipAddress: this.user?.memberAddress,
      shipPhone: this.user?.memberPhone,
      orderItems: this.cartItems.map((item) => ({
        productvariantsId: item.productvariantsId,
        unitPriceAtOrder: item.unitpriceatCart,
        quantity: item.quantity,
      })),
    };

    console.log('Proceeding to checkout with items:', payload);

    // 2) 呼叫後端 /api/TNorders (範例)
    this.http
      .post<any>('https://localhost:7107/api/TNorders', payload)
      .subscribe({
        next: (res) => {
          console.log('訂單已建立:', res);

          // ====> 3) 只清空前端的購物車，不呼叫後端
          this.cartItemsService.clearCart();

          // 4) 收合 side-cart
          this.isCartVisible = false;

          // 5) 導到訂單確認頁 (若有)
          const orderId = res.orderId;
          const ecpayUrl = `https://localhost:7107/api/TNorders/createECPayPayment/${orderId}`;
          window.location.href = ecpayUrl;
          // this.alertService.success('訂單建立成功，訂單編號:' + res.orderId);
        },
        error: (err) => {
          console.error('建立訂單失敗:', err);
          alert('建立訂單失敗：' + (err.message || err.statusText));
        },
      });
  }
  // 範例：檢查是否有缺貨或其他無效商品，並設定 hasError
  checkForErrors() {
    this.hasError = this.cartItems.some((item) => item.stock <= 0);
  }
}
