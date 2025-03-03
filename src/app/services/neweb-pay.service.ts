import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NewebPayService {

  constructor(private client: HttpClient) { }

  createPayment(paymentData:any) {
    return this.client.post(`https://localhost:7107/api/Newebpay`, paymentData);
  }
}
