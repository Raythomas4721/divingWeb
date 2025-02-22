import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private coursesService: TccoursesService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const courseId = Number(idParam);
      this.loadCourseDetails(courseId);
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
  
}
