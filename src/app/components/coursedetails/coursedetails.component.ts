import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TccoursesService } from 'src/app/services/tccourses.service';

@Component({
  selector: 'app-coursedetails',
  templateUrl: './coursedetails.component.html',
  styleUrls: ['./coursedetails.component.css']
})
export class CoursedetailsComponent implements OnInit {
  courseData: any = {};  // 確保不會 undefined
  imageData: string = 'assets/images/courses/noImage_500x300.png'; // 預設圖片
  coachImageData: string = 'assets/images/courses/defaultCoach.jpg'; // 預設教練圖片
  courseId:number=-1;

  constructor(
    private route: ActivatedRoute,
    private coursesService: TccoursesService,
    private router:Router

  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id') );
    
    if (this.courseId) {
      this.loadCourseDetails(this.courseId);
    }
  }

  loadCourseDetails(id: number): void {
    this.coursesService.getCourseById(id).subscribe(
      (data) => {
        this.courseData = data;
  
        // ✅ 確保教練照片顯示
        if (data.base64CoachPhoto) {
          this.coachImageData = `data:image/jpeg;base64,${data.base64CoachPhoto}`;
        } else {
          this.coachImageData = 'assets/images/courses/defaultCoach.jpg'; // 預設教練圖片
        }
  
        // ✅ 確保課程圖片顯示
        if (data.base64Photo) {
          this.imageData = `data:image/jpeg;base64,${data.base64Photo}`;
        } else {
          this.imageData = 'assets/images/courses/noImage_500x300.png'; // 預設課程圖片
        }
      },
      (error) => {
        console.error('獲取課程數據失敗:', error);
      }
    );
  }

  navToCoursecheckout(){

    
    // this.router.navigate([路徑],{要傳遞的物件})                  
    // this.router.navigate(['coursecheckout'],{
    //   state:{courseId:this.courseId}
    // });
    if (this.courseId > 0) {
      console.log('即將導航到 checkout，傳遞的 courseId:', this.courseId);
  
      // ✅ `queryParams` 確保即使 `state` 遺失，也能取得 `courseId`
      this.router.navigate(['coursecheckout', this.courseId], {
        state: { courseId: this.courseId },
        queryParams: { courseId: this.courseId }
      });
    } else {
      console.error('無效的 courseId，無法導航至 checkout:', this.courseId);
    }
   
  }
  
}
