import { map } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { TccoursesService } from 'src/app/services/tccourses.service';
import { TcordersService } from 'src/app/services/tcorders.service';
import { UserService } from 'src/app/services/user.service';

interface Order {
orderStatus: any;
  memberName: any;
  orderId: number;
  courseId: number;
  memberId: number;
  courseName: string;
  categoryName: string;
  levelName: string;
  coachName: string;
  coursePrice: number;
  quantity: number;
  orderDate: string;
  startAt: string;
  photo?: string; 
  imageData?: string;//用來顯示圖片的轉換後屬性
  isButtonDisabled :boolean;
}

interface Course {
  courseId: number;
  courseCategoryId: number;
  levelId: number;
  coachId: number;
  coursePrice: number;
  discription: string;
  courseStatus: boolean;
}

interface Category {
  id: number;
  name: string;
}



@Component({
  selector: 'app-courseorderreceived',
  templateUrl: './courseorderreceived.component.html',
  styleUrls: ['./courseorderreceived.component.css']
})
export class CourseorderreceivedComponent implements OnInit{
 
    keyword: string = '';
   
    originalCoursesData: any[] = []; 
    // courseCategories: { [key: string]: string; } | undefined
    courseCategories: Category[] = []; // 存儲課程分類
    selectedCategory: string = ''; // 選擇的分類 ID
  
  
    sortBy: string = ''; // 排序欄位
    sortDirection: 'asc' | 'desc' = 'asc'; // 升序或降序
    
    user?: UserDTO | null;
    // orderData: any = null; // 存放訂單數據
    orderData: Order | null = null; // 當前訂單資料
    orderHistoryData: Order[] = []; // 歷史訂單資料
    uniqueCategories: string[] = []; // 存放唯一的分類名稱
 
  
    constructor(
      private coursesService: TccoursesService,
      private authService: AuthService,
      private userService: UserService,
      private router: Router,
      private ordersService:TcordersService
    ) {}
  
    
    ngOnInit(): void {
      this.ordersService.orderData$.subscribe(data => {
        if (data) {
                   
          this.orderData = data;
          console.log("✅ 訂單數據更新:", this.orderData);
          
          // **🚀 立即刷新歷史訂單**
          this.loadOrderHistory(true);
        }
      });
    
      // **確保已登入會員**
      this.authService.user$.subscribe(user => {
        this.user = user;
        if (!this.user) {
          console.warn("⚠ 未登入，將導回首頁");
          this.router.navigate(['/']);
          return;
        }
        console.log("👤 目前登入的用戶:", this.user);
    
        // **確保登入後載入歷史訂單**
        this.loadOrderHistory(false);
      });

      console.log("🕒 訂單時間 startAt：", this.orderHistoryData.map(o => o.startAt));
    }
    
    loadOrderHistory(forceRefresh: boolean = false) {
      if (!this.user?.memberId) {
        console.error("❌ 會員資料不完整，無法載入訂單");
        return;
      }
    
      this.ordersService.getOrdersByMemberId(this.user.memberId).subscribe(
        (data: Order[]) => {
          if (!data || data.length === 0) {
            console.warn("⚠ 沒有歷史訂單");
            return;
          }    
    
          console.log("📜 API 回傳的歷史訂單:", data);
    
          // **🚀 確保圖片格式轉換**
          this.orderHistoryData = data.map(order => ({
            ...order,
            isButtonDisabled:this.checkCancelable(order.startAt),
          
            //isButtonDisabled=this.checkCancelable(order.startAt);
            imageData: this.getImage(order.photo)
          }));
          console.log("object",this.orderHistoryData);
    
        //   // **🚀 確保最新訂單在最前面**
        //   this.orderHistoryData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    
        //   // **🚀 若 `orderData` 為空，或是強制刷新，則更新最新訂單**
        //   if (!this.orderData || forceRefresh) {
        //     this.orderData = this.orderHistoryData[0];
        //   }
    
        //   console.log("✅ 最新訂單:", this.orderData);
        // },
        // error => {
        //   console.error("❌ 獲取歷史訂單失敗:", error);
        // }
    });
    }
    

      getImage(photo: string | null | undefined): string {
        if (!photo) return 'assets/images/courses/noImage_500x300.png'; // 預設圖片
        return `data:image/jpeg;base64,${photo}`;
      }

     
      
  // /////////
  sortOrders(column: string) {
    if (this.sortBy === column) {
      // 如果點擊相同欄位，就切換排序方向
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // 點擊新的欄位，改變排序依據
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
  
    this.orderHistoryData.sort((a: any, b: any) => {
      let valueA = a[column];
      let valueB = b[column];
  
      // 如果是日期或時間欄位，轉換為時間戳進行比較
      if (column.includes('At') || column === 'orderDate') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
  
      // 如果是計算後的金額 totalPrice (coursePrice * quantity)，需要額外計算
      if (column === 'totalPrice') {
        valueA = a.coursePrice * a.quantity;
        valueB = b.coursePrice * b.quantity;
      }
  
      if (this.sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  
    console.log(`🔄 訂單已依據 ${column} 進行 ${this.sortDirection} 排序`, this.orderHistoryData);
  }
    loadCourses() {
      this.coursesService.getCourses().subscribe(
        (data) => {
          // 檢查 `data` 是否為陣列，若不是則初始化為空陣列
          if (!Array.isArray(data)) {
            console.error('API 回傳的資料不是陣列:', data);
            this.orderHistoryData = [];
            return;
          }
  
          // 儲存原始課程數據
        this.originalCoursesData = data.map(course => ({
          ...course,
          imageData: course.photo 
            ? `data:image/jpeg;base64,${course.photo}` 
            : 'assets/images/courses/noImage_500x300.png'
        }));
  
        
        this.orderHistoryData = [...this.originalCoursesData];
          console.log('課程資料:', this.orderHistoryData);
        },
        (error) => {
          console.error('獲取課程數據失敗', error);
        }
      );
    }
  
   
  
    filterCourses() {
      this.orderHistoryData = this.orderHistoryData.filter(order => {
        const matchCategory = this.selectedCategory ? order.categoryName === this.selectedCategory : true;
        const matchKeyword = this.keyword
          ? order.courseName.toLowerCase().includes(this.keyword.toLowerCase()) ||
            order.categoryName.toLowerCase().includes(this.keyword.toLowerCase()) ||
            order.levelName.toLowerCase().includes(this.keyword.toLowerCase()) ||
            order.coachName.toLowerCase().includes(this.keyword.toLowerCase())
          : true;
        return matchCategory && matchKeyword;
      });
    }
    resetFilter() {
      this.keyword = '';
    this.selectedCategory = '';
    this.loadOrderHistory(); // 重新載入訂單
    }
  
     // 判斷是否在 7 天內
     checkCancelable(startAt :string):boolean {
      if (!startAt) {
        return true;
       
         // 若沒有 startAt，則禁用按鈕
      }
      let orderStartAt = new Date(startAt);
      const today = new Date();
      const cancelDeadline = new Date(orderStartAt);
      cancelDeadline.setDate(orderStartAt.getDate()-7)
      return today >= cancelDeadline;
    // const endDate= new Date(this.orderData.startAt)
    //   const today = new Date(); // 獲取當前日期 2/27
      
    //   const sevenDaysBeforeStart = new Date(endDate); //2/28
    //   sevenDaysBeforeStart.setDate(endDate.getDate() - 7); // 計算開始前 7 天的日期  2/21
    //  console.log('time',sevenDaysBeforeStart);
    //  if( today >= sevenDaysBeforeStart){
    //    this.isButtonDisabled =false;
    //    console.log('isButtonDisabled',this.isButtonDisabled);
    //  }
      //return today <= sevenDaysBeforeStart; // 若今天日期 >= 課程開始前 7 天，則按鈕禁用
    }
  
    deleteCourse(courseId: number) {
      
      if (confirm('確定取消此訂單？')) {
        // this.courses = this.courses.filter(course => course.courseId !== courseId);
        this.filterCourses();
      }
    }
    getCategoryName(categoryId: number): string {
      const category = this.courseCategories.find(cat => cat.id === categoryId);
      return category ? category.name : '未知分類';
    }
  
    getdisbled(){
      alert("test")
    }

}
