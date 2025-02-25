import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TsiterentalService } from 'src/app/services/tsiterental.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-site-reserve',
  templateUrl: './site-reserve.component.html',
  styleUrls: ['./site-reserve.component.css']
})
export class SiteReserveComponent {
  siteDetails: any;

  constructor(
    private route: ActivatedRoute,
    private tsiterentalService: TsiterentalService
  ) { }
  // selectedDate = '';  儲存選擇的日期

  // updateDate(event: any): void {
  //   this.selectedDate = event.target.value;
  //   console.log('Selected Date:', this.selectedDate)
  // };

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


