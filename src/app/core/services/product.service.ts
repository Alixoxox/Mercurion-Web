import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Product, BackendProduct } from '../../shared/models/product';

export interface PaginatedProducts {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface RawPaginated<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = process.env['NG_APP_API_URL'];
  private categories$?: Observable<string[]>;

  getAll(page: number, size: number): Observable<PaginatedProducts> {
    return this.http
      .get<RawPaginated<BackendProduct>>(`${this.apiUrl}/product/all`, { params: { page, size } })
      .pipe(
        map(res => ({
          content: (res.content ?? []).map(p => this.mapProduct(p)),
          totalElements: res.page?.totalElements,
          totalPages: res.page?.totalPages,
          number: res.page?.number,
          size: res.page?.size,
        }))
      );
  }

  getById(id: number): Observable<Product | null> {
    return this.http
      .get<BackendProduct>(`${this.apiUrl}/product/${id}`)
      .pipe(map(p => (p ? this.mapProduct(p) : null)));
  }

  getCategories(): Observable<string[]> {
    if (!this.categories$) {
      this.categories$ = this.http
        .get<string[]>(`${this.apiUrl}/product/categories`)
        .pipe(shareReplay(1));
    }
    return this.categories$;
  }

  getByCategory(category: string): Observable<Product[]> {
    return this.http
      .get<BackendProduct[]>(`${this.apiUrl}/product/category/${encodeURIComponent(category)}`)
      .pipe(map(list => (list ?? []).map(p => this.mapProduct(p))));
  }

  private mapProduct(p: BackendProduct): Product {
    const ratings = p.ratings ?? [];
    const count = ratings.length;
    const rate = count ? ratings.reduce((sum, r) => sum + r.value, 0) / count : 0;
    return {
      id: p.id,
      title: p.title,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.image,
      stock: p.stock,
      wishlistedBy: p.wishlistedBy,
      rating: { rate: Math.round(rate * 10) / 10, count },
    };
  }
}
