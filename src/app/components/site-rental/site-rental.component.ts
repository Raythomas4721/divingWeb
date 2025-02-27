import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { TsiterentalService } from 'src/app/services/tsiterental.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-site-rental',
  templateUrl: './site-rental.component.html',
  styleUrls: ['./site-rental.component.css']
})
export class SiteRentalComponent implements OnInit {

  siteDetails: any;
  keyword: string = ''; // 用於儲存搜尋關鍵字
  selectedRegion: string = ''; // 用於儲存所選區域
  private searchKeyword$ = new Subject<string>();
  private regionMap: { [key: string]: string } = {
    "1": "北部",
    "2": "中部",
    "3": "南部",
    "4": "東部"
  };

  constructor(
    private userService: UserService,
    private tsiterentalService: TsiterentalService) { }

  ngOnInit(): void {
    this.loadSiteDetails(); // 初始化時載入所有場地

    // 使用 RxJS 的 Subject 和 debounceTime 來處理關鍵字搜尋
    this.searchKeyword$.pipe(
      debounceTime(300), // 延遲 300 毫秒
      distinctUntilChanged() // 只有在關鍵字改變時才發送請求
    ).subscribe(keyword => {
      this.searchSites(keyword);
    });
  }

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

  // 修改後的 searchSites 方法，接收關鍵字參數
  searchSites(keyword: string): void {
    if (keyword.trim() === '') {
      this.loadSiteDetails(); // 如果關鍵字為空，則重新載入所有場地
      return;
    }

    this.tsiterentalService.searchSites(keyword).subscribe({
      next: (res) => {
        this.siteDetails = res; // 使用搜尋結果更新 siteDetails
        console.log("搜尋結果:", this.siteDetails);
      },
      error: (err) => {
        console.error("搜尋失敗", err);
        this.siteDetails = []; // 搜尋失敗時清空結果
      }
    });
  }

  // 當關鍵字輸入框的值改變時，觸發此方法
  onKeywordChange(keyword: string): void {
    this.searchKeyword$.next(keyword);
  }

  // 當區域選擇改變時，觸發此方法
  onRegionChange(region: string): void {
    this.selectedRegion = region;
    this.loadSiteDetails();
    console.log("搜尋結果:", this.selectedRegion);
  }
}
