import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { TsiterentalService } from 'src/app/services/tsiterental.service';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-site-detail',
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.css']
})
export class SiteDetailComponent {
  siteDetails: any;
  sitedetailarea:any='';
  selectedRegion: any = '';
  temperature: string = '';
  condition: string = '';
  @Input() city: string = '';

  constructor(
    private route: ActivatedRoute,
    private tsiterentalService: TsiterentalService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // 從路由參數中獲取 siteId
    const siteId = this.route.snapshot.paramMap.get('id');

    if (siteId) {
      // 使用 siteId 從 API 中獲取 siteDetails 資料
      this.tsiterentalService.getsiterentalById(siteId).subscribe({
        next: (res) => {
          this.siteDetails = res;
          console.log(this.siteDetails);
        },
        error: (err) => {
          console.log(err);
        }
      });}}

      loadSiteDetails(): void {
        this.tsiterentalService.getsiterental(this.selectedRegion).subscribe({
          next: (res) => {
            this.siteDetails = res;
            console.log(this.siteDetails);
          },
          error: (err) => {
            console.log(err);
          }
        });
      }

      onAreaChange(area: number): void {
        this.sitedetailarea = area;
        this.loadSiteDetails();

      }


      }






