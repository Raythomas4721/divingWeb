import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ShopComponent } from './components/shop/shop.component';
import { UsedProductsComponent } from './components/used-products/used-products.component';
import { CoursesComponent } from './components/courses/courses.component';
import { SiteRentalComponent } from './components/site-rental/site-rental.component';
import { HomeComponent } from './components/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ShopcartComponent } from './components/shopcart/shopcart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShopproductshowComponent } from './components/shopproductshow/shopproductshow.component';
import { ProcategoriesComponent } from './components/procategories/procategories.component';
import { ProfileComponent } from './components/profile/profile.component';
@NgModule({
  declarations: [
    AppComponent,
    ShopComponent,
    UsedProductsComponent,
    CoursesComponent,
    SiteRentalComponent,
    HomeComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    ShopcartComponent,
    ShopproductshowComponent,
    ProcategoriesComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
