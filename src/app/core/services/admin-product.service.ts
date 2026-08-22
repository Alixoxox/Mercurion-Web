import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
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
  page = signal(0);
  pageSize = signal(15);
  totalPages = signal(0);
  totalElements = signal(0);

  private search = '';
  private category = '';
  private sort = '';

  load(page = 0, search = this.search, category = this.category, sort = this.sort): void {
    this.search = search;
    this.category = category;
    this.sort = sort;
    this.loading.set(true);
    this.productService.getAll(page, this.pageSize(), search, category, sort).subscribe({
      next: (res) => {
        this.products.set(res.content);
        this.page.set(res.number ?? page);
        this.pageSize.set(res.size ?? this.pageSize());
        this.totalPages.set(res.totalPages ?? 0);
        this.totalElements.set(res.totalElements ?? 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.loading.set(false);
      },
    });
  }

  refresh(): void {
    this.load(this.page());
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.load(page);
  }

  setSearch(search: string): void {
    this.load(0, search, this.category, this.sort);
  }

  create(draft: ProductDraft, imageFile?: File | null): Observable<string> {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(draft)], { type: 'application/json' }));
    if (imageFile) formData.append('image', imageFile, imageFile.name);
    return this.http.post(`${this.apiUrl}/admin/product/create`, formData, { responseType: 'text' }).pipe(
      tap(() => this.load(0, this.search, this.category, this.sort))
    );
  }

  update(product: Product, imageFile?: File | null): Observable<string> {
    const { rating, ...body } = product;
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(body)], { type: 'application/json' }));
    if (imageFile) formData.append('image', imageFile, imageFile.name);
    return this.http.put(`${this.apiUrl}/admin/product/edit/${product.id}`, formData, { responseType: 'text' }).pipe(
      tap(() => this.refresh())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/product/del/${id}`).pipe(
      tap(() => this.refresh())
    );
  }

  updateStock(id: number, delta: number): Observable<string> {
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