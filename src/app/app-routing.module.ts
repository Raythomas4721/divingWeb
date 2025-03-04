import { UsedProductsComponent } from './components/used-products/used-products.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Sideshopcart } from './components/sideshopcart/side-cart.component';
import { ShopproductshowComponent } from './components/shopproductshow/shopproductshow.component';
import { HomeComponent } from './components/home/home.component';
import { ShopComponent } from './components/shop/shop.component';
import { CoursesComponent } from './components/courses/courses.component';
import { SiteRentalComponent } from './components/site-rental/site-rental.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CoursedetailsComponent } from './components/coursedetails/coursedetails.component';
import { CoursecheckoutComponent } from './components/coursecheckout/coursecheckout.component';
import { CourseorderreceivedComponent } from './components/courseorderreceived/courseorderreceived.component';
import { UsedproductshowComponent } from './components/usedproductshow/usedproductshow.component';
import { SiteDetailComponent } from './components/site-detail/site-detail.component';
import { SiteReserveComponent } from './components/site-reserve/site-reserve.component';
import { SiteOrderComponent } from './components/site-order/site-order.component';
import { AuthSuccessComponent } from './components/auth-success/auth-success.component';
import { CoursesManagementComponent } from './components/coursesmanagement/coursesmanagement.component';
import { CoursecreateComponent } from './coursecreate/coursecreate.component';
import { EcpayResultComponent } from './components/ecpay-result/ecpay-result.component';
import { ProfileOrdersComponent } from './components/profile-orders/profile-orders.component';
import { UsedproductListComponent } from './components/usedproduct-list/usedproduct-list.component';
import { UsedproducteditComponent } from './components/usedproductedit/usedproductedit.component';
import { AuthGuard } from './auth.guard';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CourseEmptyComponent } from './components/course-empty/course-empty.component';
const routes: Routes = [
  { path: 'auth-success', component: AuthSuccessComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'shop/:categoryId', component: ShopComponent },
  { path: 'used-products', component: UsedProductsComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'courses/:id', component: CoursedetailsComponent },
  { path: 'site-rental', component: SiteRentalComponent },
  // 定義帶有 id 參數的路由
  { path: 'site-detail', component: SiteDetailComponent },
  { path: 'site-detail/:id', component: SiteDetailComponent },
  // 其他路由
  { path: 'site-reserve', component: SiteReserveComponent },
  { path: 'site-reserve/:id', component: SiteReserveComponent },
  { path: 'shopcart', component: Sideshopcart },
  { path: 'shopproductshow/:id', component: ShopproductshowComponent },
  // { path: 'procategories', component: ProcategoriesComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile-orders',
    component: ProfileOrdersComponent,
    canActivate: [AuthGuard],
  },
  { path: 'reset-password', component: ResetPasswordComponent },

  { path: 'coursedetails/:id', component: CoursedetailsComponent },
  // { path: 'coursecheckout', component: CoursecheckoutComponent },
  { path: 'coursecheckout/:id', component: CoursecheckoutComponent },
  { path: 'courseorderreceived', component: CourseorderreceivedComponent },
  { path: 'usedproductshow/:id', component: UsedproductshowComponent },
  { path: 'site-order', component: SiteOrderComponent },
  { path: 'site-order/:id', component: SiteOrderComponent },

  { path: 'usedproductshow', component: UsedproductshowComponent },
  // { path: 'editusedproduct/:id', component: UsedproductshowComponent },
  { path: 'site-detail', component: SiteDetailComponent },
  { path: 'site-reserve', component: SiteReserveComponent },
  { path: 'coursesmanagement', component: CoursesManagementComponent },
  { path: 'coursecreate', component: CoursecreateComponent },
  { path: 'usedproduct-list', component: UsedproductListComponent },
  { path: 'editusedproduct/:id', component: UsedproductListComponent },
  { path: 'coursecreate', component: CoursecreateComponent },
  { path: 'usedproductedit/:id', component: UsedproducteditComponent },
  //   { path: 'course/create', component: CoursecreateupdateComponent },
  //   { path: 'course/edit/:id', component: CoursecreateupdateComponent }
  { path: 'ecpayResult', component: EcpayResultComponent },
  { path: 'newebpay', component: CourseEmptyComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // 404 頁面導回首頁
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      // scrollPositionRestoration: 'enabled',
      useHash: true,
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
