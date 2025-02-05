import { Component } from '@angular/core';
import { TNcartItemDTO } from 'src/app/interface/TNcartItemDTO';
import { TNcartItemsService } from './../../services/tncart-items.service';

@Component({
  selector: 'app-shopcart',
  templateUrl: './shopcart.component.html',
  styleUrls: ['./shopcart.component.css'],
})
export class ShopcartComponent {
  cartItems: TNcartItemDTO[] = [];

  constructor(private cartItemsService: TNcartItemsService) {}

  ngOnInit(): void {
    // 假設 userId = 1
    // this.cartItemsService.getCartItems(1).subscribe({
    //   next: (items) => {
    //     this.cartItems = items;
    //   },
    //   error: (err) => {
    //     console.error('載入購物車失敗', err);
    //   },
    // });
  }
}
