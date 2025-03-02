// import { TestBed } from '@angular/core/testing';

// import { ProductsService } from './products.service';

// describe('ProductsService', () => {
//   let service: ProductsService;

//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//     service = TestBed.inject(ProductsService);
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
// });
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService]
    });

    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // 確保所有 HTTP 要求都已處理
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch used products', () => {
    const dummyProducts = [
      { productId: 1, productName: '商品1', price: 100 },
      { productId: 2, productName: '商品2', price: 200 }
    ];

    service.getUsedProducts().subscribe((products) => {
      expect(products.length).toBe(2);
      expect(products).toEqual(dummyProducts);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/used-products`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyProducts);
  });

  it('should delete a product', () => {
    const productId = 1;

    service.deleteProduct(productId).subscribe((response) => {
      expect(response).toEqual({ message: '刪除成功' });
    });

    const req = httpMock.expectOne(`${service.apiUrl}/delete-product/${productId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '刪除成功' });
  });
});
