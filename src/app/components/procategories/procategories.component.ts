import { TNcategoryDTO } from './../../interface/TNproductDTO';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TncategoriesService } from 'src/app/services/tncategories.service';

@Component({
  selector: 'app-procategories',
  templateUrl: './procategories.component.html',
  styleUrls: ['./procategories.component.css'],
})
export class ProcategoriesComponent {
  categories: TNcategoryDTO[] = [];

  constructor(
    private categoryService: TncategoriesService,
    private router: Router
  ) {}
  ngOnInit() {
    // 撈取所有分類
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => console.error(err),
    });
  }

  goToShop(productCategoryId: number) {
    // 跳轉到 /shop/123
    console.log('categoryId =>', productCategoryId);
    this.router.navigate(['/shop', productCategoryId]);
  }
}
