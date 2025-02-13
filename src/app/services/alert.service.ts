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
      position: 'center',
      timer: 1500,
      timerProgressBar: true,
      // toast: true,
      showConfirmButton: false,
      width: '340px'
    });
  }
  error(title: string): void {
    Swal.fire({
      title: title,
      icon: 'error',
      position: 'bottom-end',
      timer: 2000,
      timerProgressBar: true,
      toast: true,
      showConfirmButton: false,
      width: '300px'
    });
  }
}
