import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TNcartItemsService } from 'src/app/services/tncart-items.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-ecpay-result',
  templateUrl: './ecpay-result.component.html',
  styleUrls: ['./ecpay-result.component.css'],
})
export class EcpayResultComponent {
  orderId?: number; // 用來接收從綠界返回時帶的訂單編號 (query string)

  constructor(
    private route: ActivatedRoute,
    private cartItemsService: TNcartItemsService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) 從網址的 queryParams 抓出 orderId (若你有在後端傳 ?orderId=xxx 回來)
    this.route.queryParams.subscribe((params) => {
      this.orderId = +params['orderId'];
      // 2) 如果 orderId 存在，可以視情況呼叫後端查詢最終付款狀態
      // 這裡先簡化，假設只要顯示「訂單成立成功」，然後清空購物車即可
      if (this.orderId) {
        // 清空購物車 (建議在確定付款成功後再清空)
        this.cartItemsService.clearCart();

        // 顯示通知訊息
        this.alertService.success(`訂單已完成付款！編號: ${this.orderId}`);
      }
      setTimeout(() => {
        this.router.navigate(['/home']);
        // 或 this.router.navigate(['/memberOrders']);
      }, 2000);
    });
  }
}
