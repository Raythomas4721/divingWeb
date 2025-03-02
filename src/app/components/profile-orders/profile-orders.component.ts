import { Component, OnInit } from '@angular/core';
import { TMordersDTO } from 'src/app/interface/TMordersDTO';
import { UserDTO } from 'src/app/interface/userDTO';
import { AuthService } from 'src/app/services/auth.service';
import { TmordersService } from 'src/app/services/tmorders.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile-orders',
  templateUrl: './profile-orders.component.html',
  styleUrls: ['./profile-orders.component.css']
})
export class ProfileOrdersComponent implements OnInit {
  constructor(private authService: AuthService, private userService: UserService, private TmordersService: TmordersService) { }
  orders: TMordersDTO[] = [];
  filteredOrders: TMordersDTO[] = [];
  selectedOrderType: string = '';
  isLoading: boolean = false;
  user?: UserDTO | null;
  memberId?: number | null;

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user || null;
      if (user) {
        console.log(this.user);
        this.memberId = user.memberId;
        this.loadOrders();
      } else {
        console.log("等待 API 返回，用戶資料尚未載入");
      }
    });
  }

  loadOrders() {
    this.isLoading = true;

    if (this.memberId === null || this.memberId === undefined) {
      console.error('無法載入訂單：memberId 未定義');
      this.isLoading = false;
      return;
    }

    this.TmordersService.getAllOrders(this.memberId).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filterOrders();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('載入訂單失敗:', err);
        this.isLoading = false;
      }
    });
  }

  filterOrders() {
    if (this.selectedOrderType) {
      this.filteredOrders = this.orders.filter(order => order.orderType === this.selectedOrderType);
    } else {
      this.filteredOrders = [...this.orders];
    }
  }

  getStatusClass(order: TMordersDTO): string {
    const status = order.orderStatus?.toLowerCase();
    if (status === 'pending') return 'status-pending';
    if (status === 'shipped') return 'status-shipped';
    if (status === 'completed') return 'status-completed';
    return '';
  }
}
