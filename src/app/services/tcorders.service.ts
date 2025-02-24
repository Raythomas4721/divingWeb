import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TcordersService {

  constructor(private client:HttpClient) { }

  getOrders():Observable<any>{
    return this.client.get('https://localhost:7107/api/TCorders');
  }

  createOrder(orderData: any): Observable<string> {
    return this.client.post<string>('https://localhost:7107/api/TCorders',orderData);
  }

}
