import { Component, OnInit } from '@angular/core';
import { TccoursesService } from 'src/app/services/tccourses.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  coursesData: any[] = []; // 存放 API 回傳的課程資料
  filteredCourses: any[] = []; // 篩選後的課程
  searchTerm: string = ''; // 關鍵字搜尋
  selectedCategory: string = ''; // 選擇的課程分類

  constructor(private coursesService: TccoursesService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.coursesService.getCourses().subscribe(
      (data) => {
        if (!Array.isArray(data)) {
          console.error('API 回傳的資料不是陣列:', data);
          this.coursesData = [];
          return;
        }
        this.coursesData = data.map(course => ({
          ...course,
          imageData: course.photo 
            ? `data:image/jpeg;base64,${course.photo}` 
            : 'assets/images/courses/noImage_500x300.png'
        }));
        this.filteredCourses = this.coursesData; // 初始顯示所有課程
      },
      (error) => {
        console.error('獲取課程數據失敗', error);
      }
    );
  }

  // 關鍵字搜尋
  searchCourses(event: Event): void {
    event.preventDefault(); // 阻止表單刷新頁面
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredCourses = this.coursesData.filter(course => 
      course.categoryName.toLowerCase().includes(searchLower) ||
      course.description.toLowerCase().includes(searchLower) ||
      course.levelName.toLowerCase().includes(searchLower) ||
      course.coachName.toLowerCase().includes(searchLower)
    );
  }

  // 根據課程分類過濾
  // filterByCategory(category: string): void {
  //   this.selectedCategory = category;
  //   this.filteredCourses = this.coursesData.filter(course => course.categoryName === category);
  // }
  // filterByCategory(category: string): void {
  //   this.selectedCategory = category.trim(); // 移除前後空格
  //   this.filteredCourses = this.coursesData.filter(course => 
  //     course.categoryName.trim() === this.selectedCategory
  //   );
  // }

  filterByCategory(category: string): void {
    this.selectedCategory = category.trim(); // 移除前後空格
    this.filteredCourses = this.coursesData.filter(course => 
      course.categoryName.trim() === this.selectedCategory
    );
  
    // 若沒有符合條件的課程，則顯示所有課程
    if (this.filteredCourses.length === 0) {
      console.warn(`沒有找到 ${category} 類別的課程，顯示全部`);
      this.filteredCourses = this.coursesData;
    }
  }

  // 重置篩選
  // resetFilter(): void {
  //   this.selectedCategory = '';
  //   this.searchTerm = '';
  //   this.filteredCourses = this.coursesData;
  // }
  resetFilter(): void {
    this.selectedCategory = '';
    this.searchTerm = '';
    this.filteredCourses = [...this.coursesData]; // 確保資料是複製而非空值
  }
}
