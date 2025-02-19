import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { TsiterentalService } from 'src/app/tsiterental.service';

@Component({
  selector: 'app-site-rental',
  templateUrl: './site-rental.component.html',
  styleUrls: ['./site-rental.component.css']
})
export class SiteRentalComponent {

  siteDetails: any;
  // sitedetail[] = []; // 用於儲存從 API 獲取的場地資料

  constructor(
    private userService: UserService,
    private tsiterentalService: TsiterentalService) { }

  ngOnInit(): void {
    this.tsiterentalService.getsiterental().subscribe({
      next: (res) => {
        // console.log(res);
        this.siteDetails = res;
        console.log(this.siteDetails);
      },
      error: (err) => {
        console.log(err);
      }

    })
  }


}
