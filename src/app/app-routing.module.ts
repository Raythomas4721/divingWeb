import { UsedProductsComponent } from './components/used-products/used-products.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Sideshopcart } from './components/sideshopcart/side-cart.component';
import { ShopproductshowComponent } from './components/shopproductshow/shopproductshow.component';
import { ProcategoriesComponent } from './components/procategories/procategories.component';
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
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'shop/:categoryId', component: ShopComponent },
  { path: 'used-products', component: UsedProductsComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'site-rental', component: SiteRentalComponent },
  // 定義帶有 id 參數的路由
  { path: 'site-detail', component: SiteDetailComponent },
  { path: 'site-detail/:id', component: SiteDetailComponent },
  // 其他路由
  { path: 'site-reserve', component: SiteReserveComponent },
  { path: 'site-reserve/:id', component: SiteReserveComponent },
  { path: 'shopcart', component: Sideshopcart },
  { path: 'shopproductshow/:id', component: ShopproductshowComponent },
  { path: 'procategories', component: ProcategoriesComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'coursedetails/:id', component: CoursedetailsComponent },
  { path: 'coursecheckout', component: CoursecheckoutComponent },
  { path: 'courseorderreceived', component: CourseorderreceivedComponent },
  { path: 'usedproductshow/:id', component: UsedproductshowComponent },
  { path: 'site-order', component: SiteOrderComponent },
  { path: 'site-order/:id', component: SiteOrderComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
