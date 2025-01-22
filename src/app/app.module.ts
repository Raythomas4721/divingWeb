import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ShopComponent } from './components/shop/shop.component';
import { UsedProductsComponent } from './components/used-products/used-products.component';
import { CoursesComponent } from './components/courses/courses.component';
import { SiteRentalComponent } from './components/site-rental/site-rental.component';

@NgModule({
  declarations: [
    AppComponent,
    ShopComponent,
    UsedProductsComponent,
    CoursesComponent,
    SiteRentalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
