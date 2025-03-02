import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TsiterentalService } from 'src/app/services/tsiterental.service';
//import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-site-reserve',
    templateUrl: './site-reserve.component.html',
    styleUrls: ['./site-reserve.component.css']
})
export class SiteReserveComponent implements OnInit {
    siteDetails: any;
    selectedTimePeriod: string = '';
    memberId: number = 1;
    siteDay: string = "";
    cardHolder: string = '';
    cardNumber1: string = '';
    cardNumber2: string = '';
    cardNumber3: string = '';
    cardNumber4: string = '';
    expiryMonth: string = '';
    expiryYear: string = '';
    cvv: string = '';
    phoneNumber: string = '';


    constructor(
        private route: ActivatedRoute,
        private tsiterentalService: TsiterentalService,
        private router: Router,
    ) { }
    // selectedDate = '';  儲存選擇的日期

    // updateDate(event: any): void {
    //   this.selectedDate = event.target.value;
    //   console.log('Selected Date:', this.selectedDate)
    // };

    //   ngOnInit(): void {
    //     // 從路由參數中獲取 siteId
    //     const siteId = this.route.snapshot.paramMap.get('id');

    //     if (siteId) {
    //       // 使用 siteId 從 API 中獲取 siteDetails 資料
    //       this.tsiterentalService.getsiterentalById(siteId).subscribe({
    //         next: (res) => {
    //           this.siteDetails = res;
    //           console.log(this.siteDetails);
    //         },
    //         error: (err) => {
    //           console.log(err);
    //         }
    //       });
    //     }
    //   }
    // }


    ngOnInit(): void {
        const siteId = this.route.snapshot.paramMap.get('id');

        if (siteId) {
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

    fillForm(): void {
        setTimeout(() => { // 使用 setTimeout()
            this.cardHolder = '王小明';
            this.cardNumber1 = '1234';
            this.cardNumber2 = '5678';
            this.cardNumber3 = '9012';
            this.cardNumber4 = '3456';
            this.expiryMonth = '12';
            this.expiryYear = '25';
            this.cvv = '123';
            this.phoneNumber = '886912345678';
        }, 0);
    }

    onSubmit(siteId: any): void {
        console.log("siteid", this.siteDetails.siteId)
        console.log("siteDay", this.siteDay)
        console.log("siteTIme", this.selectedTimePeriod)
        console.log("venueName", this.siteDetails.venueName)

        let theTime = "00:00:00"
        if (this.selectedTimePeriod === "上午") {
            theTime = "08:00:00"
        } else if (this.selectedTimePeriod === "下午") {
            theTime = "13:30:00"
        } else {
            theTime = "18:00:00"
        }


        //   if (!this.selectedTimePeriod) {
        //     alert('請選擇時段');
        //     return;
        //   }

        //   // 構建完整的 TSorder 物件
        const orderData = {
            memberId: this.memberId,
            //orderId: 0,  後端自動生成
            siteId: parseInt(siteId, 10),
            venueName: this.siteDetails.venueName,
            siteDay: this.siteDay,
            siteTime: theTime,//this.selectedTimePeriod,
            sitePay: 0
        };

        //   // const orderData = {
        //   //   "orderId": 0,
        //   //   "memberId": 1,
        //   //   "siteId": 1,
        //   //   "venueName": "bbb",
        //   //   "siteDay": "2025-02-27",
        //   //   "siteTime": "12:50:34",
        //   //   "sitePay": 0
        //   // };

        this.tsiterentalService.createOrder(orderData).subscribe({
            next: (res) => {
                console.log('訂單建立成功', res);
                this.router.navigate(['/site-order', siteId]);
            },
            error: (err) => {
                console.error('訂單建立失敗', err);
            }
        });
    }
}
