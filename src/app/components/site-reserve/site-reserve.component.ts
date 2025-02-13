import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-site-reserve',
  templateUrl: './site-reserve.component.html',
  styleUrls: ['./site-reserve.component.css']
})
export class SiteReserveComponent {
  constructor(private router: Router) {

  }
  selectedDate = ''; // 儲存選擇的日期

  updateDate(event: any): void {
    this.selectedDate = event.target.value;
    console.log('Selected Date:', this.selectedDate);
  }

}
