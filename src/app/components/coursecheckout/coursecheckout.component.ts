import { NewebPayService } from './../../services/neweb-pay.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TccoursesService } from 'src/app/services/tccourses.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserDTO } from 'src/app/interface/userDTO';
import { TcordersService } from 'src/app/services/tcorders.service';
import { UserService } from 'src/app/services/user.service';
import { TCcourse } from 'src/app/interface/tccourse';

@Component({
  selector: 'app-coursecheckout',
  templateUrl: './coursecheckout.component.html',
  styleUrls: ['./coursecheckout.component.css'],

})
export class CoursecheckoutComponent implements OnInit {
  courseData: any = {};  // 確保不會 undefined
  courseId: number = -1;
  quantity: number = 1;
  courseName: string = '';  //
  coursePrice: number = 0;  //
  memberId: number | null = null;  // ✅ 存放會員 ID
  // memberId:number=22;
  orderStatus: boolean = true; // ✅ 訂單狀態：已確認
  orderDate: string = new Date().toLocaleString(); // ✅ 轉成 `YYYY-MM-DDTHH:mm:ss` 格式
  user?: UserDTO | null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private coursesService: TccoursesService,
    private authService: AuthService,  // ✅ 注入 AuthService
    private ordersService: TcordersService,
    private userService: UserService,
    private newebPayService: NewebPayService
  ) { }


  ngOnInit(): void {
    this.getCourseId();

    this.authService.user$.subscribe(user => {
      if (user) {
        this.user = user;
        this.memberId = this.user?.memberId ?? -1;//設定 memberId (即使 this.user 是 undefined，memberId 仍然有預設值，不會影響程式執行。)
        console.log("🔵 用戶資料已載入:", this.user);
        console.log("🆔 取得的 memberId:", this.memberId);
      } else {
        console.warn("⚠ 等待 API 返回，用戶資料尚未載入");
      }
    });
  }

  getCourseId(): void {
    // 優先從 `queryParams` 獲取最新的 courseId
    this.route.queryParams.subscribe(params => {
      if (params['courseId']) {
        this.courseId = Number(params['courseId']); // ✅ 取得最新的 courseId
        sessionStorage.setItem('courseId', String(this.courseId)); // ✅ 立即更新 sessionStorage
        console.log('🟠 直接從 queryParams 取得並更新 courseId:', this.courseId);
        this.loadCourseDetails(this.courseId);
      } else {
        // 如果 `queryParams` 沒有，則嘗試從 `sessionStorage` 獲取
        const storedCourseId = sessionStorage.getItem('courseId');
        if (storedCourseId) {
          this.courseId = Number(storedCourseId);
          console.log('🟢 從 sessionStorage 取得 courseId:', this.courseId);
          this.loadCourseDetails(this.courseId);
        } else {
          console.warn('❌ 無法獲取 courseId，導回課程詳情頁');
          this.router.navigate(['/coursedetails']);
        }
      }
    });
  }


  // loadCourseDetails(id: number): void {
  //   this.coursesService.getCourseById(id).subscribe(
  //     (data) => {
  //       this.courseData = data;

  //       // ✅ 確保教練照片顯示
  //       // if (data.base64CoachPhoto) {
  //       //   this.coachImageData = `data:image/jpeg;base64,${data.base64CoachPhoto}`;
  //       // } else {
  //       //   this.coachImageData = 'assets/images/courses/defaultCoach.jpg'; // 預設教練圖片
  //       // }

  //       // ✅ 確保課程圖片顯示
  //       // if (data.base64Photo) {
  //       //   this.imageData = `data:image/jpeg;base64,${data.base64Photo}`;
  //       // } else {
  //       //   this.imageData = 'assets/images/courses/noImage_500x300.png'; // 預設課程圖片
  //       // }
  //     },
  //     (error) => {
  //       console.error('獲取商品數據失敗:', error);
  //     }
  //   );
  // }

  submitOrder(): void {
    console.log('📝 準備提交訂單...');
    console.log('🆔 memberId:', this.memberId);
    console.log('📘 courseId:', this.courseId);
    console.log('💰 coursePrice:', this.coursePrice);
    console.log('📦 quantity:', this.quantity);

    if (!this.memberId || this.memberId < 1 || this.courseId < 1) {
      console.error('❌ 無法提交訂單：缺少必要資訊');
      alert("會員 ID 或 課程 ID 無效，請重新登入後再試。");
      return;
    }

    const orderData = {
      memberId: this.memberId,
      courseId: this.courseId,
      coursePrice: this.coursePrice,
      quantity: this.quantity,
      orderDate: new Date().toISOString(),
      orderStatus: true
    };

    console.log("🔍 傳送訂單資料:", orderData);


    this.ordersService.createOrder(orderData).subscribe(
      (response: any) => {
        console.log('✅ 訂單提交成功:', response);
        console.log(typeof (response.amount), typeof (response.orderId), `${response.orderId}`);
        this.newebPayService.createPayment({
          Amount: response.amount,
          OrderId: `${response.orderId}`,
          ProductName: ' '
        }).subscribe((res: any) => {
          console.log('newebpay', res);
          // 創建一個 <form> 表單
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = res.paymentUrl;

          // 創建 MerchantID 的 <input> 欄位
          const merchantIdInput = document.createElement('input');
          merchantIdInput.type = 'hidden';
          merchantIdInput.name = 'MerchantID';
          merchantIdInput.value = res.merchantID;
          form.appendChild(merchantIdInput);

          // 創建 TradeInfo 的 <input> 欄位
          const tradeInfoInput = document.createElement('input');
          tradeInfoInput.type = 'hidden';
          tradeInfoInput.name = 'TradeInfo';
          tradeInfoInput.value = res.tradeInfo;
          form.appendChild(tradeInfoInput);

          // 創建 TradeSha 的 <input> 欄位
          const tradeShaInput = document.createElement('input');
          tradeShaInput.type = 'hidden';
          tradeShaInput.name = 'TradeSha';
          tradeShaInput.value = res.tradeSha;
          form.appendChild(tradeShaInput);


          // 創建 Version 的 <input> 欄位
          const Version = document.createElement('input');
          Version.type = 'hidden';
          Version.name = 'Version';
          Version.value = '2.2';
          form.appendChild(Version);

          // 將表單加入到 body，並自動提交
          document.body.appendChild(form);
          console.log("formData", form, res);
          form.submit();
        });
        // if (response.orderId) {
        //   const finalOrderData = { ...orderData, orderId: response.orderId };

        //   this.ordersService.setOrderData(finalOrderData); // 🚀 存入 TcordersService & sessionStorage

        //   this.router.navigate(['/courseorderreceived']);
        // } else {
        //   console.warn('⚠ 訂單建立成功，但未收到 orderId');
        // }
      },
      (error) => {
        console.error('❌ 提交訂單失敗:', error);
        alert(`訂單提交失敗，錯誤訊息: ${error.error?.message || '未知錯誤'}`);
      }
    );
  }
  loadCourseDetails(id: number): void {
    if (!id || id < 1) {
      console.error('❌ 無效的 courseId:', id);
      return;
    }

    this.coursesService.getCourseById(id).subscribe(
      (data) => {
        if (data) {
          this.courseData = data;  // ✅ 確保 courseData 有數據
          this.courseName = data.courseName || '未知課程';  // ✅ 提供預設值
          this.coursePrice = data.coursePrice || 0;
          console.log('✅ 成功獲取課程數據:', this.courseData);
        } else {
          console.warn('⚠ 獲取的課程數據為空');
        }
      },
      (error) => {
        console.error('❌ 獲取課程數據失敗:', error);
      }
    );
  }

  changeQuantity(q: number) {
    const newQuantity = this.quantity + q
    if (newQuantity < 1) {
      this.quantity = 1;
    } else if (newQuantity > 6) {
      this.quantity = 6;
    } else {
      this.quantity = newQuantity;
    }
  }
}
