import { Component, OnInit } from '@angular/core';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { TccoursesService } from 'src/app/services/tccourses.service';
import { UserService } from 'src/app/services/user.service';

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
 
    // courses: Course[] = [];
    // filteredCourses: Course[] = [];
    // courseCategories: Category[] = [
    //   { id: 1, name: '瑜珈' },
    //   { id: 2, name: '重訓' },
    //   { id: 3, name: '有氧' }
    // ];
    keyword: string = '';
    coursesData: any[] = [];// 確保型別為陣列
    originalCoursesData: any[] = []; 
    // courseCategories: { [key: string]: string; } | undefined
    courseCategories: Category[] = []; // 存儲課程分類
    selectedCategory: string = ''; // 選擇的分類 ID
  
  
    sortBy: string = ''; // 排序欄位
    sortDirection: 'asc' | 'desc' = 'asc'; // 升序或降序
    
    user?: UserDTO | null;
  
    constructor(
      private coursesService: TccoursesService,
      private authService: AuthService,
      private userService: UserService,
    ) {}
  
    
      ngOnInit(): void {
        this.loadCourses();
        this.loadCategories(); // 載入分類

        this.authService.user$.subscribe(user => {
          this.user = user?.user;
          if (user) {
            console.log("用戶資料已載入:", this.user);
          } else {
            console.log("等待 API 返回，用戶資料尚未載入");
          }
        });
        
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
      
        this.coursesData.sort((a: any, b: any) => {
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
            this.coursesData = [];
            return;
          }
  
          // 儲存原始課程數據
        this.originalCoursesData = data.map(course => ({
          ...course,
          imageData: course.photo 
            ? `data:image/jpeg;base64,${course.photo}` 
            : 'assets/images/courses/noImage_500x300.png'
        }));
  
          // 確保 `data` 是有效陣列後再執行 map()
          // this.coursesData = data.map(course => ({
          //   ...course,
          //   imageData: course.photo 
          //     ? `data:image/jpeg;base64,${course.photo}` 
          //     : 'assets/images/courses/noImage_500x300.png' // 預設圖片
          // }));
          // 預設 coursesData 也是原始數據
        this.coursesData = [...this.originalCoursesData];
          console.log('課程資料:', this.coursesData);
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
      // 先回復到完整的課程列表
    this.coursesData = this.originalCoursesData.filter(course => {
      // 檢查是否有選擇分類
      const matchCategory = this.selectedCategory
        ? course.courseCategoryId == +this.selectedCategory
        : true;
  
      // 關鍵字搜尋（針對課程名稱、描述等）
      const matchKeyword = this.keyword
        ? course.discription.toLowerCase().includes(this.keyword.toLowerCase()) || 
          course.categoryName.toLowerCase().includes(this.keyword.toLowerCase()) ||
          course.levelName.toLowerCase().includes(this.keyword.toLowerCase()) ||
          course.coachName.toLowerCase().includes(this.keyword.toLowerCase())
        : true;
  
      // 同時符合分類與關鍵字才會顯示
      return matchCategory && matchKeyword;
    });
    }
  
    resetFilter() {
      this.keyword = '';
      this.selectedCategory = '';
      this.coursesData = [...this.originalCoursesData]; // 回復原始課程數據 
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
