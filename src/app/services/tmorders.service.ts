import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TMordersDTO } from '../interface/TMordersDTO';

@Injectable({
  providedIn: 'root'
})
export class TmordersService {
  private apiUrl = 'https://localhost:7107/api/TMOrders/orders';

  constructor(private client: HttpClient) { }

  getAllOrders(memberId: number): Observable<TMordersDTO[]> {
    return this.client.get<TMordersDTO[]>(this.apiUrl, {
      params: { memberId: memberId.toString() }
    });
  }
}
