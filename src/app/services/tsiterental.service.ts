import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TsiterentalService {

  siteDetails: any;
  // siteorder: any;


  constructor(private client: HttpClient) { }
  private apiUrl = "https://localhost:7107/api/TSsiteDetails"
  // private orderapiUrl = "https://localhost:7107/api/TSorder"

  getsiterental() {
    return this.client.get(`${this.apiUrl}`)
  }

  getsiterentalById(siteId: any) {
    return this.client.get(`${this.apiUrl}/${siteId}`);
  }
  // getsiteorderById(siteId: any) {
  //   return this.client.get(`${this.orderapiUrl}/${siteId}`);
  // }
}

