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

        // 檢查是否有圖片
        if (data.photo) {
          this.imageData = `data:image/jpeg;base64,${data.photo}`;
        }
      },
      (error) => {
        console.error('獲取課程數據失敗:', error);
      }
    );
  }
}
