import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private client: HttpClient) { }

  account = "abc";
  password = "123";
  getAns() {
    return {
      account: this.account,
      password: this.password
    }
  }
  getUserInfo() {
    return this.client.get("https://localhost:7077/api/TMmemberListsAPI")
  }
}
