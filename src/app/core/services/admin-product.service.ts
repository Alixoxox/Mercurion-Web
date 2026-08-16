import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../shared/models/product';
import { DUMMY_PRODUCTS } from '../../shared/data/dummy-products';

const STORAGE_KEY = 'admin_products';

type ProductDraft = Omit<Product, 'id' | 'rating'>;

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private http = inject(HttpClient);
  private apiUrl = process.env['NG_APP_API_URL'];
  products = signal<Product[]>([]);

  load(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.products.set(JSON.parse(raw));
        return;
      } catch {
        // corrupted storage -> reseed below
      }
    }
    this.products.set([...DUMMY_PRODUCTS]);
    this.persist();
  }

  create(draft: ProductDraft): Product {
    const product: Product = { ...draft, id: this.nextId(), rating: { rate: 0, count: 0 } };
    this.products.set([...this.products(), product]);
    this.persist();
    return product;
  }

  update(product: Product): void {
    this.products.set(this.products().map(p => (p.id === product.id ? product : p)));
    this.persist();
  }

  delete(id: number): void {
    this.products.set(this.products().filter(p => p.id !== id));
    this.persist();
  }

  updateStock(id: number, delta: number): void {
    this.products.set(
      this.products().map(p => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
    );
    this.persist();
  }

  bulkUpload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/product/bulk`, formData);
  }

  private nextId(): number {
    const ids = this.products().map(p => p.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products()));
    } catch {
      // storage unavailable — keep in-memory state only
    }
  }
}