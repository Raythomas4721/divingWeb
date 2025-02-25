import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private loginModalVisibleSubject = new BehaviorSubject<boolean>(false);
  loginModalVisible$ = this.loginModalVisibleSubject.asObservable();

  showLoginModal(): void {
    this.loginModalVisibleSubject.next(true);
  }

  hideLoginModal(): void {
    this.loginModalVisibleSubject.next(false);
  }
}
