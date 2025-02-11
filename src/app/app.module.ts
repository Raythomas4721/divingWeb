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
import { Sideshopcart } from './components/sideshopcart/side-cart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProcategoriesComponent } from './components/procategories/procategories.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LightboxModule } from 'ngx-lightbox';
import { ShopproductshowComponent } from './components/shopproductshow/shopproductshow.component';
import { CoursedetailsComponent } from './components/coursedetails/coursedetails.component';
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
    Sideshopcart,
    ShopproductshowComponent,
    ProcategoriesComponent,
    ProfileComponent,
    CoursedetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    LightboxModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
