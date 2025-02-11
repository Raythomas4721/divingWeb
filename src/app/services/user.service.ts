import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDTO } from '../interface/userDTO';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private client: HttpClient) { }
  private apiUrl = 'https://localhost:7107/api/TMmemberListsAPI';

  register(name: string, email: string, password: string) {
    const headers = {
      name: name,
      email: email,
      password: password
    }
    return this.client.post(`${this.apiUrl}/register`, headers)
  }
  login(username: string, password: string): Observable<any> {
    const headers = { email: username, password: password };
    return this.client.post(`${this.apiUrl}/login`, headers);
  }
  getUserProfile(): Observable<UserDTO> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.client.get<UserDTO>(`${this.apiUrl}/profile`, { headers });
  }

  uploadProfilePhoto(formData: FormData): Observable<{ memberPhoto: string }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });

    return this.client.patch<{ memberPhoto: string }>(
      `${this.apiUrl}/ChangeUserPhoto`,
      formData,
      { headers, reportProgress: true }
    );
  }
}
