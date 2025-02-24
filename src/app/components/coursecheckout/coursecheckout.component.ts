import { ActivatedRoute, Router } from '@angular/router';
import { Component} from '@angular/core';
import { TccoursesService } from 'src/app/services/tccourses.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserDTO } from 'src/app/interface/userDTO';
import { TcordersService } from 'src/app/services/tcorders.service';

@Component({
  selector: 'app-coursecheckout',
  templateUrl: './coursecheckout.component.html',
  styleUrls: ['./coursecheckout.component.css']
})
export class CoursecheckoutComponent {
courseData: any = {};  // 確保不會 undefined
courseId:number=-1;
quantity:number=1;
courseName:string='';  //
coursePrice:number=0;  //
memberId: number | null = null;  // ✅ 存放會員 ID
orderStatus: boolean = true; // ✅ 訂單狀態：已確認
orderDate: string = new Date().toLocaleString(); // ✅ 轉成 `YYYY-MM-DDTHH:mm:ss` 格式


constructor(
  private router:Router,
  private route:ActivatedRoute,
  private coursesService: TccoursesService,
  private authService: AuthService,  // ✅ 注入 AuthService
  private ordersService:TcordersService
){}


ngOnInit(): void {

  // 1️⃣ 嘗試從 `state` 取得 `courseId`
  const navigation = this.router.getCurrentNavigation();
  const state = navigation?.extras.state as { courseId?: number };

  if (state?.courseId) {
    this.courseId = state.courseId;
    sessionStorage.setItem('courseId', String(this.courseId)); // ✅ 存入 sessionStorage
    console.log('從 state 取得 courseId:', this.courseId);
  } else {
    // 2️⃣ 若 `state` 無法獲取，嘗試從 `sessionStorage`
    const storedCourseId = sessionStorage.getItem('courseId');
    if (storedCourseId) {
      this.courseId = Number(storedCourseId);
      console.log('從 sessionStorage 取得 courseId:', this.courseId);
    } else {
      // 3️⃣ 如果 `sessionStorage` 也沒有，最後嘗試從 `queryParams` 取得
      this.route.queryParams.subscribe((params) => { 
        if (params['courseId']) {
          this.courseId = Number(params['courseId']);
          sessionStorage.setItem('courseId', String(this.courseId)); // ✅ 存入 sessionStorage
          console.log('從 queryParams 取得 courseId:', this.courseId);
        }
      });
    }
  }

  // 4️⃣ 確保 `courseId` 有效，否則導回 `coursedetails`
  if (this.courseId > 0) {
    this.loadCourseDetails(this.courseId);
  } else {
    console.warn('無法獲取 courseId，導回課程詳情頁');
    this.router.navigate(['/coursedetails']);
  }

  // // ✅ 訂閱 `authService.user$` 來取得會員資訊
  // this.authService.user$.subscribe((user: UserDTO | null) => {
  //   if (user && user.memberId) {
  //     this.memberId = Number(user.memberId); // ✅ 確保轉換為數字
  //     console.log('獲取會員 ID:', this.memberId);
  //   } else {
  //     console.warn('會員未登入，請先登入');
  //     this.router.navigate(['/login']); // ✅ 若未登入則導向登入頁面
  //   }
  // });

  // // ✅ 從 `queryParams` 取得 `courseId`, `coursePrice`, `courseName`
  // this.route.queryParams.subscribe(params => {
  //   if (params['courseId']) {
  //     this.courseId = Number(params['courseId']);
  //   }
  //   if (params['coursePrice']) {
  //     this.coursePrice = Number(params['coursePrice']);
  //   }
  //   if (params['courseName']) {
  //     this.courseName = params['courseName'];
  //   }
  // });

  // // // 1️⃣ 嘗試從 `state` 取得 `courseId`
  // // const navigation = this.router.getCurrentNavigation();
  // // const state = navigation?.extras.state as { courseId?: number };

  // // if (state?.courseId) {
  // //   this.courseId = state.courseId;
  // //   sessionStorage.setItem('courseId', String(this.courseId)); // ✅ 存入 sessionStorage
  // //   console.log('從 state 取得 courseId:', this.courseId);
  // // } else {
  // //   // 2️⃣ 若 `state` 無法獲取，嘗試從 `sessionStorage`
  // //   const storedCourseId = sessionStorage.getItem('courseId');
  // //   if (storedCourseId) {
  // //     this.courseId = Number(storedCourseId);
  // //     console.log('從 sessionStorage 取得 courseId:', this.courseId);
  // //   } else {
  // //     // 3️⃣ 如果 `sessionStorage` 也沒有，最後嘗試從 `queryParams` 取得
  // //     this.route.queryParams.subscribe((params: { courseId?: string }) => { 
  // //       if (params.courseId) {
  // //         this.courseId = Number(params.courseId);
  // //         sessionStorage.setItem('courseId', String(this.courseId)); // ✅ 存入 sessionStorage
  // //         console.log('從 queryParams 取得 courseId:', this.courseId);
  // //       }
  // //     });
  // //   }
  // // }

  // // // 4️⃣ 確保 `courseId` 有效，否則導回 `coursedetails`
  // // if (this.courseId > 0) {
  // //   this.loadCourseDetails(this.courseId);
  // // } else {
  // //   console.warn('無法獲取 courseId，導回課程詳情頁');
  // //   this.router.navigate(['/coursedetails']);
  // // }


  // // const navigation = this.router.getCurrentNavigation();
  // // const state = navigation?.extras.state as { courseId?: number };

  // // if (state?.courseId) {
  // //   this.courseId = state.courseId;
  // //   sessionStorage.setItem('courseId', String(this.courseId)); // ✅ 存入 sessionStorage
  // // } else {
  // //   // ✅ 如果 state 不存在，嘗試從 sessionStorage 取出
  // //   const storedCourseId = sessionStorage.getItem('courseId');
  // //   if (storedCourseId) {
  // //     this.courseId = Number(storedCourseId);
  // //     console.log('從 sessionStorage 取得 courseId:', this.courseId);
  // //   } else {
  // //     console.warn('無法獲取 courseId，導回課程詳情頁');
  // //     this.router.navigate(['/coursedetails']);
  // //     return;
  // //   }
  // // }

  // // console.log('成功獲取 courseId:', this.courseId);
  // // this.loadCourseDetails(this.courseId);
 
  // // if (state?.courseId) {
  // //   this.courseId = state.courseId;
  // // } else {
  // //   console.warn('無法獲取 courseId，可能是使用者手動刷新頁面');
  // // }

  // // // 確保 courseId 有效，否則導回 coursedetails
  // // if (this.courseId > 0) {
  // //   this.loadCourseDetails(this.courseId);
  // // } else {
  // //   this.router.navigate(['/coursedetails']);
  // // }

  // // if(navigation?.extras.state){
  // //   this.courseId =(navigation?.extras.state as{courseId:number}).courseId; 
  // //   if(this.courseId > 0){
  // //     this.loadCourseDetails(this.courseId);
  // //   }
  // // } 
  console.log(this.courseData);
  console.log(this.courseId);
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
  if (!this.memberId || this.courseId < 1) {
    console.error('無法提交訂單：缺少必要資訊');
    return;
  }

  const orderData = {
    memberId: this.memberId,
    courseId: this.courseId,
    coursePrice: this.coursePrice,
    quantity: this.quantity,
    orderDate: new Date().toLocaleString(),   //toLocaleString() 轉換為當地時間
    orderStatus: true
  };

  this.ordersService.createOrder(orderData).subscribe(response => {
    console.log('訂單提交成功:', response);
    this.router.navigate(['/courseorderreceived']); // ✅ 導向訂單完成頁面
  }, error => {
    console.error('提交訂單失敗:', error);
  });
}

loadCourseDetails(id: number): void {
  this.coursesService.getCourseById(id).subscribe(
    (data) => {
      if (data) {
        this.courseData = data;  // ✅ 確保 courseData 有數據
        this.courseName = data.courseName || '未知課程';  // ✅ 提供預設值
        this.coursePrice = data.coursePrice || 0;
        console.log('成功獲取課程數據:', this.courseData);
      } else {
        console.warn('獲取的課程數據為空');
      }
    },
    (error) => {
      console.error('獲取課程數據失敗:', error);
    }
  );

  // this.coursesService.getCourseById(id).subscribe(
  //   (data) => {
  //     if (data) {
  //       this.courseData=data;
  //       this.courseName=data.courseName||'未知課程' //|| '未知課程'->提供預設值，null、undefined或者空字串時，用'未知課程'當預設值。
  //       this.coursePrice=data.coursePrice||0
        
  //       // this.courseData = {
  //       //   courseName: data.courseName || '未知課程', //|| '未知課程'->提供預設值，null、undefined或者空字串時，用'未知課程'當預設值。
  //       //   coursePrice: data.coursePrice || 0
  //       // };
  //     }
  //   },
  //   (error) => {
  //     console.error('獲取商品數據失敗:', error);
  //   }
  // );
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
