import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, throwError } from 'rxjs';
import { Product } from '../../shared/models/product';
import { ProductService } from './product.service';

type ProductDraft = Omit<Product, 'id' | 'rating'>;

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private http = inject(HttpClient);
  private apiUrl = process.env['NG_APP_API_URL'];
  private productService = inject(ProductService);
  products = signal<Product[]>([]);
  loading = signal(false);
  private loaded = false;

  load(): void {
    if (this.loaded || this.loading()) return;
    this.loading.set(true);
    this.fetchAll(0, []);
  }

  private fetchAll(page: number, acc: Product[]): void {
    this.productService.getAll(page, 100).subscribe({
      next: (res) => {
        const all = [...acc, ...res.content];
        if (page + 1 < res.totalPages) {
          this.fetchAll(page + 1, all);
        } else {
          this.products.set(all);
          this.loaded = true;
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.loading.set(false);
      },
    });
  }

  refresh(): void {
    this.loaded = false;
    this.load();
  }

  create(draft: ProductDraft, imageFile?: File | null): Observable<Product> {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(draft)], { type: 'application/json' }));
    if (imageFile) formData.append('image', imageFile, imageFile.name);
    return this.http.post<Product>(`${this.apiUrl}/admin/product/create`, formData).pipe(
      finalize(() => this.refresh())
    );
  }

  update(product: Product, imageFile?: File | null): Observable<Product> {
    const { rating, ...body } = product;
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(body)], { type: 'application/json' }));
    if (imageFile) formData.append('image', imageFile, imageFile.name);
    return this.http.put<Product>(`${this.apiUrl}/admin/product/edit/${product.id}`, formData).pipe(
      finalize(() => this.refresh())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/product/del/${id}`).pipe(
      finalize(() => this.refresh())
    );
  }

  updateStock(id: number, delta: number): Observable<Product> {
    const product = this.products().find(p => p.id === id);
    if (!product) return throwError(() => new Error('Product not found'));
    return this.update({ ...product, stock: Math.max(0, product.stock + delta) });
  }

  bulkUpload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/admin/products/bulk`, formData, { responseType: 'text' });
  }
}