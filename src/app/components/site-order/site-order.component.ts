import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-site-order',
  templateUrl: './site-order.component.html',
  styleUrls: ['./site-order.component.css']
})
export class SiteOrderComponent {
  selectedPaymentMethod: string = 'cash'; // 預設值為 "Cash on delivery"

  constructor() { }

  ngOnInit(): void {
  }
}
