import { UsedProductsComponent } from './components/used-products/used-products.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShopcartComponent } from './components/shopcart/shopcart.component';
import { ShopproductshowComponent } from './components/shopproductshow/shopproductshow.component';
import { ProcategoriesComponent } from './components/procategories/procategories.component';
import { HomeComponent } from './components/home/home.component'
import { ShopComponent } from './components/shop/shop.component'
import { CoursesComponent } from './components/courses/courses.component'
import { SiteRentalComponent } from './components/site-rental/site-rental.component'
import { ProfileComponent } from './components/profile/profile.component'

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'shop/:categoryId', component: ShopComponent },
  { path: 'used-products', component: UsedProductsComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'site-rental', component: SiteRentalComponent },
  { path: 'shopcart', component: ShopcartComponent },
  { path: 'shopproductshow/:id', component: ShopproductshowComponent },
  { path: 'procategories', component: ProcategoriesComponent },
  { path: 'profile', component: ProfileComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
