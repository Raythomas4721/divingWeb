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
  TNcartItemDTO: TNcartItemDTO[] = [];
  couponCode: string = '';
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
  removeItem(index: number) {
    this.cartItemsService.removeItem(index);
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
}
