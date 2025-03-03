import { map, NotFoundError } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { TccoursesService } from 'src/app/services/tccourses.service';
import { TcordersService } from 'src/app/services/tcorders.service';
import { UserService } from 'src/app/services/user.service';

interface Order {
  orderStatus: boolean;
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
  imageData?: string; //用來顯示圖片的轉換後屬性
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

      
     
      // 確保已登入會員
      this.authService.user$.subscribe(user => {
        this.user = user;
        if (!user) {
          console.warn("⚠ 未登入，將導回首頁");
          this.router.navigate(['/']);
          return;
        }
        console.log("👤 目前登入的用戶:", this.user);
        
    
        // 確保登入後載入歷史訂單
        this.loadOrderHistory(false);

        this.ordersService.getLatestOrderById(user.memberId).subscribe(latestorder=>{
          this.orderData= latestorder;
          console.log("lasrorder",latestorder)
          console.log(this.orderData)
        })
      });

      // 抓memberId最新一筆訂單存orderData
      // if(this.user?.memberId == null){
      //   alert("請登入會員")
      //   return;
      // }
      

      //凍結按鈕的時間測試
      console.log("訂單時間 startAt：", this.orderHistoryData.map(o => o.startAt));
    }
    
   
    loadOrderHistory(forceRefresh: boolean = false) {
      if (!this.user?.memberId) {
        console.error("會員資料不完整，無法載入訂單");
        return;
      }
    
      this.ordersService.getOrdersByMemberId(this.user.memberId).subscribe(
        (data: Order[]) => {
          if (!data || data.length === 0) {
            console.warn("沒有歷史訂單");
            return;
          }    
    
          console.log("API 回傳的歷史訂單:", data);
    
          // 確保圖片格式轉換**
          this.orderHistoryData = data.map(order => ({
            ...order,
            isButtonDisabled:this.checkCancelable(order.startAt),
          
            //isButtonDisabled=this.checkCancelable(order.startAt);
            imageData: this.getImage(order.photo)
          }));
          console.log("object",this.orderHistoryData);

    });
    }


  getImage(photo: string | null | undefined): string {
        if (!photo) return 'assets/images/courses/noImage_500x300.png'; // 預設圖片
        return `data:image/jpeg;base64,${photo}`;
      }

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
  
    console.log(`訂單已依據 ${column} 進行 ${this.sortDirection} 排序`, this.orderHistoryData);
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
  
    }
  
   
    getCategoryName(categoryId: number): string {
      const category = this.courseCategories.find(cat => cat.id === categoryId);
      return category ? category.name : '未知分類';
    }
  

    editOrderStatus(order: Order, newStatus: boolean) {
      if (order.orderId == null) {
        console.error("訂單ID不存在");
        return;
      }
    
      const updatedOrder: Order = {
        ...order,
        orderStatus: newStatus // 設定新的訂單狀態
      };

      console.log("即將發送的訂單更新請求:", updatedOrder);
      
    
      this.ordersService.editOrderStatus(order.orderId, updatedOrder).subscribe(
        response => {
          console.log("訂單狀態更新成功:", response);
          this.loadOrderHistory(true); 
        },
        error => {
          console.error("訂單狀態更新失敗:", error);
        }
      );
    }

    // editOrderStatus(order: Order, newStatus: boolean) {
    //   if (!order?.orderId) {
    //     console.error("訂單 ID 不存在");
    //     return;
    //   }
    
     
    //   const updatedOrder: Order = {
    //     ...order,
    //     orderStatus: newStatus
    //   };
      
    
    //   console.log("即將發送的訂單更新請求:", updatedOrder); //確認請求內容
    
    //   this.ordersService.editOrderStatus(order.orderId, updatedOrder).subscribe({
    //     next: (response) => {
    //       console.log("訂單狀態更新成功:", response);
    //       this.loadOrderHistory(true);
    //     },
    //     error: (error) => {
    //       console.error("訂單狀態更新失敗:", error);
    //       if (error.error) {
    //         console.error("API 回傳錯誤內容:", error.error);
    //       }
    //     }
    //   });
    // }


}
