import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedcartService {
  private openCartSubject = new Subject<void>();
  openCart$ = this.openCartSubject.asObservable();

  openCartPanel() {
    this.openCartSubject.next();
  }

  constructor() {}
}
