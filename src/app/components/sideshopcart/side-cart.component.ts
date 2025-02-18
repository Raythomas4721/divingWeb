import { SharedcartService } from './../../services/sharedcart.service';
import { Component } from '@angular/core';
import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { TNcartItemsService } from '../../services/tncart-items.service';

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

  subTotal: number = 0;
  total: number = 0;

  constructor(
    private cartItemsService: TNcartItemsService,
    private sharedcartService: SharedcartService
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
      next: (res) => console.log('刪除成功', res),
      error: (err) => console.error('刪除失敗', err),
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
      return;
    }
    // 在此實作進行結帳流程，例如導向至結帳頁面
    console.log('Proceeding to checkout with items:', this.cartItems);
  }
  // 範例：檢查是否有缺貨或其他無效商品，並設定 hasError
  checkForErrors() {
    // this.hasError = this.cartItems.some((item) => item.outOfStock);
  }
}
