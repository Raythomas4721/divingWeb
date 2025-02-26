import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit} from '@angular/core';
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
export class CoursecheckoutComponent implements OnInit{
courseData: any = {};  // 確保不會 undefined
courseId:number=-1;
quantity:number=1;
courseName:string='';  //
coursePrice:number=0;  //
// memberId: number | null = null;  // ✅ 存放會員 ID
memberId:number=22;
orderStatus: boolean = true; // ✅ 訂單狀態：已確認
orderDate: string = new Date().toLocaleString(); // ✅ 轉成 `YYYY-MM-DDTHH:mm:ss` 格式
user?: UserDTO | null;


constructor(
  private router:Router,
  private route:ActivatedRoute,
  private coursesService: TccoursesService,
  private authService: AuthService,  // ✅ 注入 AuthService
  private ordersService:TcordersService,
  private userService: UserService,
){}


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
  console.log('📝 訂單提交前數據檢查:');
  console.log('🆔 memberId:', this.memberId);
  console.log('📘 courseId:', this.courseId);
  console.log('💰 coursePrice:', this.coursePrice);
  console.log('📦 quantity:', this.quantity);

  if (!this.memberId || this.courseId < 1) {
    console.error('❌ 無法提交訂單：缺少必要資訊');
    return;
  }

  const orderData = {
    memberId: this.memberId,
    courseId: this.courseId,
    courseName: this.courseName,
    coursePrice: this.coursePrice,
    quantity: this.quantity,
    orderDate: new Date().toISOString(),
    orderStatus: true
  };

  this.ordersService.createOrder(orderData).subscribe(
    response => {
      console.log('✅ 訂單提交成功:', response);

      // ✅ 使用 Router 傳遞 `state` 來帶入訂單數據
      this.router.navigate(['/courseorderreceived'], {
        state: { orderData }  // ✅ 把 orderData 帶入導航
      });
    },
    error => {
      console.error('❌ 提交訂單失敗:', error);
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

changeQuantity(q:number){
  const newQuantity = this.quantity+q
    if(newQuantity<1){
      this.quantity=1;
    }else if(newQuantity >6){
      this.quantity=6;
    }else{
      this.quantity=newQuantity;
    }  
  }
}
