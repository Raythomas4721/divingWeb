import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TsiterentalService {

  constructor(private client: HttpClient) { }
  private apiUrl = "https://localhost:7107/api/TSsiteDetails"
  getsiterental() {
    return this.client.get(`${this.apiUrl}`)
  }
}
