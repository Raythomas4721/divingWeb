import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { TccoursesService } from 'src/app/services/tccourses.service';
import { TcordersService } from 'src/app/services/tcorders.service';
import { UserService } from 'src/app/services/user.service';

interface Order {
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
      // 🚀 優先從 TcordersService 讀取訂單數據
      this.ordersService.orderData$.subscribe(data => {
        if (data) {
          this.orderData = data;
          console.log("✅ 從 TcordersService 取得訂單數據:", this.orderData);
        } else {
          // 🚀 若 TcordersService 無數據，則檢查 `router.navigate({ state })`
          const navigation = this.router.getCurrentNavigation();
          this.orderData = navigation?.extras.state?.['orderData'] || null;
    
          if (!this.orderData) {
            // 🚀 若 `state` 也沒有，則嘗試從 `sessionStorage` 補充
            console.warn("⚠ 訂單數據遺失，嘗試從 sessionStorage 還原...");
            this.ordersService.loadOrderDataFromSession();
            this.orderData = this.ordersService.getOrderData();
          }
    
          if (!this.orderData) {
            console.error("❌ 仍無法獲取訂單數據，將重新獲取歷史訂單");
            this.loadOrderHistory();
          } else {
            console.log("🟢 從 sessionStorage 還原訂單數據:", this.orderData);
          }
        }
      });
    
      // 🚀 訂閱用戶數據
      this.authService.user$.subscribe(user => {
        this.user = user;
        
        if (!this.user) {
          console.warn("⚠ 未登入，將導回首頁");
          this.router.navigate(['/']);
          return;
        }
    
        console.log("👤 目前登入的用戶:", this.user);
    
        // 確保取得 `memberId` 後再載入訂單
        this.loadOrderHistory();
      });
    
      console.log("📦 訂單數據:", this.orderData);
      console.log("📜 歷史訂單:", this.orderHistoryData);
    }
    
    loadOrderHistory() {
      if (!this.user?.memberId) {
        console.error("會員資料不完整，無法載入訂單");
        return;
      }
    
      this.ordersService.getOrdersByMemberId(this.user.memberId).subscribe(
        (data: Order[]) => {
          if (!data || data.length === 0) {
            console.warn("⚠ 沒有歷史訂單");
            return;
          }
    
          console.log("📜 API 回傳的歷史訂單:", data);
    
          // ✅ 確保前端排序（如果 API 沒有排序）
          this.orderHistoryData = data
            .map(order => ({
              ...order,
              imageData: this.getImage(order.photo) // ✅ 確保 photo 轉換為 imageData
            }))
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()); // ✅ 確保最新訂單在最前
    
          // ✅ 取得最新的一筆訂單
          this.orderData = this.orderHistoryData[0];
    
          console.log("✅ 最新訂單:", this.orderData);
        },
        error => {
          console.error("❌ 獲取歷史訂單失敗:", error);
        }
      );
    }
    // loadOrderHistory() {
    //   if (!this.user?.memberId) {
    //     console.error("會員資料不完整，無法載入訂單");
    //     return;
    //   }
    
    //   this.ordersService.getOrdersByMemberId(this.user.memberId).subscribe(
    //     (data: Order[]) => {
    //       this.orderHistoryData = data.map(order => ({
    //         ...order,
    //         imageData: this.getImage(order.imageData) // 使用 getImage 轉換圖片
    //       }));
    //       console.log("📜 歷史訂單:", this.orderHistoryData);
    
    //       // 取得所有唯一的課程分類
    //       this.uniqueCategories = Array.from(new Set(this.orderHistoryData.map(order => order.categoryName)));
    //     },
    //     error => {
    //       console.error("❌ 獲取歷史訂單失敗:", error);
    //     }
    //   );
    //   console.log("!!!!!"+ImageData)
    // }

      // 轉換 Uint8Array 圖片為 Base64
      // getImage(photo: string | Uint8Array | null | undefined): string {
      //   if (!photo) return 'assets/images/courses/noImage_500x300.png'; // 預設圖片
      
      //   if (typeof photo === 'string') {
      //     return `data:image/jpeg;base64,${photo}`; // 已經是 Base64 字串，直接返回
      //   }
      
      //   const binary = new Uint8Array(photo).reduce((acc, byte) => acc + String.fromCharCode(byte), '');
      //   return `data:image/jpeg;base64,${btoa(binary)}`;
      // }

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
  
    loadCategories() {
      this.coursesService.getCategories().subscribe(
        (data: Category[]) => {
          if (!Array.isArray(data)) {
            console.error('API 回傳的分類資料不是陣列:', data);
            this.courseCategories = [];
            return;
          }
          this.courseCategories = data;
        },
        (error) => {
          console.error('獲取分類數據失敗', error);
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
  
    addCourse() {
      alert('新增課程功能 (待實作)');
    }
  
    editCourse(course: Course) {
      alert(`編輯課程：${course.discription} (待實作)`);
    }
  
    deleteCourse(courseId: number) {
      if (confirm('確定刪除此課程？')) {
        // this.courses = this.courses.filter(course => course.courseId !== courseId);
        this.filterCourses();
      }
    }
    getCategoryName(categoryId: number): string {
      const category = this.courseCategories.find(cat => cat.id === categoryId);
      return category ? category.name : '未知分類';
    }
  
    

}
