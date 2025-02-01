import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  success(title: string): void {
    Swal.fire({
      title: title,
      icon: 'success',
      position: 'top-end',
      timer: 2000,
      timerProgressBar: true,
      toast: true,
      showConfirmButton: false,
      width: '300px'
    });
  }
  error(title: string): void {
    Swal.fire({
      title: title,
      icon: 'error',
      position: 'top-end',
      timer: 2000,
      timerProgressBar: true,
      toast: true,
      showConfirmButton: false,
      width: '300px'
    });
  }
}
