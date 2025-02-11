import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDTO } from '../interfaces/userDTO';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private client: HttpClient) { }
  private apiUrl = 'https://localhost:7107/api';

  register(name: string, email: string, password: string) {
    const headers = {
      name: name,
      email: email,
      password: password
    }
    // return this.client.post(${this.apiUrl}/TMmemberListsAPI/register, headers)
  }
  login(username: string, password: string) {
    const headers = { email: username, password: password };
    // return this.client.post(${this.apiUrl}/TMmemberListsAPI/login, headers);
  }
  getUserProfile(userId: string) {
    // return this.client.get<UserDTO>(
      // ${this.apiUrl}/TMmemberListsAPI/${userId}
    // );
  }
}
