import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDTO } from '../interfaces/userDTO';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private client: HttpClient) { }
  private apiUrl = 'https://localhost:7107/api';

  login(username: string, password: string): Observable<any> {
    const headers = { "email": username, "password": password };
    return this.client.post(`${this.apiUrl}/TMmemberListsAPI/login`, headers);
  }
  getUserProfile(userId: string): Observable<UserDTO> {
    return this.client.get<UserDTO>(`${this.apiUrl}/TMmemberListsAPI/${userId}`);
  }

}
