import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TsiterentalService } from 'src/app/services/tsiterental.service';
import { UserService } from 'src/app/services/user.service';

interface WeatherResponse {
    records: {
        Locations: [
            {
                Location: {
                    LocationName: string;
                    WeatherElement: [
                        {
                            Time: {
                                StartTime: string;
                                EndTime: string;
                                ElementValue: [{ WeatherDescription: string }];
                            }[];
                        }
                    ];
                }[];
            }
        ];
    };
}

interface WeatherData {
    LocationName: string;
    StartTime: string;
    WeatherDescription: string;
}

@Component({
    selector: 'app-site-rental',
    templateUrl: './site-rental.component.html',
    styleUrls: ['./site-rental.component.css']
})
export class SiteRentalComponent implements OnInit {
    @Input() city: string = '';
    temperature: WeatherData[] = [];
    condition: string = '';
    siteDetails: any;
    keyword: string = ''; // 用於搜尋場地
    weatherKeyword: string = ''; // 用於搜尋天氣
    selectedRegion: any = '';
    sitedetailarea: any = '';
    time: string = '';
    weatherData: WeatherData[] = [];
    selectedLocation: string = '';
    private searchKeyword$ = new Subject<string>();
    private regionMap: { [key: string]: string } = {
        "1": "北部",
        "2": "中部",
        "3": "南部",
        "4": "東部"
    };

    constructor(
        private userService: UserService,
        private tsiterentalService: TsiterentalService,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        this.loadSiteDetails();
        this.fetchWeatherInfo();
        this.temperature = []; // 在初始化時清空 temperature

        this.searchKeyword$.pipe(
            debounceTime(300),
            distinctUntilChanged()
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

    searchSites(keyword: string): void {
        if (keyword.trim() === '') {
            this.loadSiteDetails();
            return;
        }

        this.tsiterentalService.searchSites(keyword).subscribe({
            next: (res) => {
                this.siteDetails = res;
                console.log("搜尋結果:", this.siteDetails);
            },
            error: (err) => {
                console.error("搜尋失敗", err);
                this.siteDetails = [];
            }
        });
    }

    onKeywordChange(keyword: string): void {
        this.searchKeyword$.next(keyword);
    }

    onRegionChange(region: number): void {
        this.selectedRegion = region;
        this.loadSiteDetails();
    }

    fetchWeatherInfo(): void {
        const apiUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=CWA-1335697B-71F0-4EF6-94C4-9CF794DE7055&format=JSON&ElementName=%E5%A4%A9%E6%B0%A3%E9%A0%90%E5%A0%B1%E7%B6%9C%E5%90%88%E6%8F%8F%E8%BF%B0&timeFrom=2025-03-02T06%3A00%3A00&timeTo=2025-03-07T06%3A00%3A00`;
        this.http.get<WeatherResponse>(apiUrl).subscribe(response => {
            console.log(response);
            this.weatherData = [];
            response.records.Locations[0].Location.forEach(location => {
                location.WeatherElement[0].Time.map(time => {
                    this.weatherData.push({
                        LocationName: location.LocationName,
                        StartTime: time.StartTime,
                        WeatherDescription: time.ElementValue[0].WeatherDescription
                    });
                });
            });
            // this.temperature = [...this.weatherData];
        });
    }

    // 篩選天氣資料
    filterWeather(): void {
        if (this.selectedLocation === '') {
            this.temperature = [...this.weatherData];
        } else {
            this.temperature = this.weatherData.filter(item => item.LocationName === this.selectedLocation);
        }
    }

    // 關鍵字搜尋
    searchWeather(keyword: string): void {
      if (keyword.trim() === '') {
        this.temperature = []; // 如果關鍵字為空，清空 temperature
        return;
      }

      this.temperature = this.weatherData.filter(item =>
        item.LocationName.includes(keyword)
      );
    }

}

