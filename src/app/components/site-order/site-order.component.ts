import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TsiterentalService } from 'src/app/services/tsiterental.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-site-order',
  templateUrl: './site-order.component.html',
  styleUrls: ['./site-order.component.css']
})
export class SiteOrderComponent {
  selectedPaymentMethod: string = 'cash'; // 預設值為 "Cash on delivery"

  siteDetails: any;

  constructor(
    private route: ActivatedRoute,
    private tsiterentalService: TsiterentalService
  ) { }

  ngOnInit(): void {
    // 從路由參數中獲取 siteId
    const siteId = this.route.snapshot.paramMap.get('id');

    if (siteId) {
      // 使用 siteId 從 API 中獲取 siteDetails 資料
      this.tsiterentalService.getsiterentalById(siteId).subscribe({
        next: (res) => {
          this.siteDetails = res;
          console.log(this.siteDetails);
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  }
}
