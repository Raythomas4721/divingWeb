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
  imageData?: string;
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
    //     this.loadCourses();//載入課程資料
    //     this.loadCategories(); // 載入分類

    //     //取得用戶資訊
    //     this.authService.user$.subscribe(user => {
    //       this.user = user?.user;
    //       if (user) {
    //         console.log("用戶資料已載入:", this.user);
    //       } else {
    //         console.log("等待 API 返回，用戶資料尚未載入");
    //       }
    //     });
    //     // ✅ 4. 透過 `router.getCurrentNavigation()` 取得 `orderData`
    // const navigation = this.router.getCurrentNavigation();
    // this.orderData = navigation?.extras.state?.['orderData'] || null;

    // if (!this.orderData) {
    //   console.warn("⚠ 訂單數據遺失，可能是直接進入該頁面");
    //   this.router.navigate(['/courses']); // 若無數據，導回首頁或其他適合的頁面
    // }

    // console.log("📦 訂單數據:", this.orderData);
    const navigation = this.router.getCurrentNavigation();
  this.orderData = navigation?.extras.state?.['orderData'] || null;

  if (!this.orderData) {
    console.warn("⚠ 訂單數據遺失，將重新獲取歷史訂單");
  } else {
    console.log("✅ 訂單數據:", this.orderData);
  }

  // 訂閱用戶數據
  this.authService.user$.subscribe(user => {
    this.user = user?.user;
    
    if (!this.user) {
      console.warn("⚠ 未登入，將導回首頁");
      this.router.navigate(['/']);
      return;
    }

    console.log("👤 目前登入的用戶:", this.user);

    // 確保取得 `memberId` 後再載入訂單
    this.loadOrderHistory();
  });

        
      }


      loadOrderHistory() {
        if (!this.user?.memberId) {
          console.error("會員資料不完整，無法載入訂單");
          return;
        }
      
        this.ordersService.getOrdersByMemberId(this.user.memberId).subscribe(
          (data: Order[]) => {
            // 處理數據
            this.orderHistoryData = data.map(order => ({
              ...order,
              imageData: order.imageData 
                ? `data:image/jpeg;base64,${order.imageData}` 
                : 'assets/images/courses/noImage_500x300.png'
            }));
            console.log("📜 歷史訂單:", this.orderHistoryData);
      
            // 取得所有唯一的課程分類
            this.uniqueCategories = Array.from(new Set(this.orderHistoryData.map(order => order.categoryName)));
          },
          error => {
            console.error("❌ 獲取歷史訂單失敗:", error);
          }
        );
      }
      
  
      sortCourses(column: string) {
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
      
          // 確保時間轉換為時間戳
          if (column.includes('At')) {
            valueA = new Date(valueA).getTime();
            valueB = new Date(valueB).getTime();
          }
      
          if (this.sortDirection === 'asc') {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        });
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
