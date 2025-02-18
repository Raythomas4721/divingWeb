import { Component, OnInit } from '@angular/core';
import { TccoursesService } from 'src/app/services/tccourses.service';

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
  selector: 'app-coursesmanagement',
  templateUrl: './coursesmanagement.component.html',
  styleUrls: ['./coursesmanagement.component.css']
})
export class CoursesManagementComponent implements OnInit {
  // courses: Course[] = [];
  // filteredCourses: Course[] = [];
  // courseCategories: Category[] = [
  //   { id: 1, name: '瑜珈' },
  //   { id: 2, name: '重訓' },
  //   { id: 3, name: '有氧' }
  // ];
  keyword: string = '';
  selectedCategory: string = '';
  coursesData: any[] = [];// 確保型別為陣列
  courseCategories: { [key: string]: string; } | undefined

  constructor(private coursesService: TccoursesService) {}

  
   
  
    ngOnInit(): void {
      this.loadCourses();
      
    }

  

  loadCourses() {
    // 假設這些課程來自 API
    // this.courses = [
    //   { courseId: 1, courseCategoryId: 1, levelId: 1, coachId: 101, coursePrice: 1500, discription: '基礎瑜珈', courseStatus: true },
    //   { courseId: 2, courseCategoryId: 2, levelId: 2, coachId: 102, coursePrice: 2000, discription: '肌力訓練', courseStatus: false },
    //   { courseId: 3, courseCategoryId: 3, levelId: 1, coachId: 103, coursePrice: 1200, discription: '有氧燃脂', courseStatus: true }
    // ];
    // this.filteredCourses = [...this.courses];
    this.coursesService.getCourses().subscribe(
      (data) => {
        // 檢查 `data` 是否為陣列，若不是則初始化為空陣列
        if (!Array.isArray(data)) {
          console.error('API 回傳的資料不是陣列:', data);
          this.coursesData = [];
          return;
        }

        // 確保 `data` 是有效陣列後再執行 map()
        this.coursesData = data.map(course => ({
          ...course,
          imageData: course.photo 
            ? `data:image/jpeg;base64,${course.photo}` 
            : 'assets/images/courses/noImage_500x300.png' // 預設圖片
        }));
        
        console.log('課程資料:', this.coursesData);
      },
      (error) => {
        console.error('獲取課程數據失敗', error);
      }
    );
  }

  filterCourses() {
    // this.filteredCourses = this.courses.filter(course => {
    //   const matchCategory = this.selectedCategory ? course.courseCategoryId == +this.selectedCategory : true;
    //   const matchKeyword = this.keyword ? course.discription.includes(this.keyword) : true;
    //   return matchCategory && matchKeyword;
    // });
  }

  resetFilter() {
    this.keyword = '';
    this.selectedCategory = '';
    // this.filteredCourses = [...this.courses];
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

  // getCategoryName(categoryId: number): string {
  //   return this.courseCategories.find(cat => cat.id === categoryId)?.name || '未知分類';
  // }

  // getLevelName(levelId: number): string {
  //   const levels = { 1: '初級', 2: '中級', 3: '高級' };
  //   return levels[levelId] || '未知等級';
  // }

  // getCoachName(coachId: number): string {
  //   const coaches = { 101: '教練 A', 102: '教練 B', 103: '教練 C' };
  //   return coaches[coachId] || '未知教練';
  // }

  // getLevelName(levelId: number): string {
  //   const levels: Record<number, string> = { 1: '初級', 2: '中級', 3: '高級' };
  //   return levels[levelId] ?? '未知等級';
  // }
  
  // getCoachName(coachId: number): string {
  //   const coaches: Record<number, string> = { 101: '教練 A', 102: '教練 B', 103: '教練 C' };
  //   return coaches[coachId] ?? '未知教練';
  // }
}