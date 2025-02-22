
// import { Component } from '@angular/core';
// import { TccoursesService } from 'src/app/services/tccourses.service';
import { Component, OnInit } from '@angular/core';
import { TccoursesService } from 'src/app/services/tccourses.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})

export class CoursesComponent implements OnInit {

  coursesData: any[] = []; // 確保型別為陣列

  constructor(private coursesService: TccoursesService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    // this.coursesService.getCourses().subscribe(
    //   (data) => {
    //     this.coursesData = data.map(course => ({
    //       ...course,
    //       imageData: course.photo 
    //         ? `data:image/jpeg;base64,${course.photo}` 
    //         : 'assets/images/default.jpg' // 預設圖片
    //     }));
    //     console.log(this.coursesData);
    //   },
    //   (error) => {
    //     console.error('獲取課程數據失敗', error);
    //   }
    // );
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
}

// export class CoursesComponent {

//   coursesData=[];

//   constructor(private coursesService:TccoursesService){
  
//   }


//   ngOnInit(): void {
//     this.coursesService.getCourses().subscribe(data=>{
//       this.coursesData = data;
//       console.log(this.coursesData);
//     })
    

//     // this.coursesService.getCourseById(5);
//   }


// }
