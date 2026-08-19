import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Feedback, PaginatedProducts, Product, RawPaginated, RawProduct } from '../../shared/models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = process.env['NG_APP_API_URL'];
  products = signal<Product[]>([]);
  categories = signal<string[]>([ "Home","Apparel","Electronics","Office","Accessories","Kitchen","Sports", "Fitness","Footwear"]);

  getAll(page: number, size: number, search = '', category = '', sort = ''): Observable<PaginatedProducts> {
    const params: Record<string, string | number> = { page, size };
    if (search) params['search'] = search;
    if (category) params['category'] = category.toUpperCase();
    if (sort) params['sort'] = sort;
    return this.http.get<RawPaginated<RawProduct>>(`${this.apiUrl}/product/all`, { params })
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
      .get<RawProduct>(`${this.apiUrl}/product/${id}`)
      .pipe(map(p => (p ? this.mapProduct(p) : null)));
  }

  getByCategory(category: string): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.apiUrl}/product/category/${encodeURIComponent(category.toUpperCase())}`)
      .pipe(map(list => (list ?? []).map(p => this.mapProduct(p))));
  }

  private mapProduct(p: RawProduct): Product {
    const ratings = p.ratings ?? [];
    const count = p.count ?? ratings.length;
    const rate = p.rate ?? (count ? ratings.reduce((sum, r) => sum + r.value, 0) / count : 0);
    return {
      id: p.id,
      title: p.title,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.image,
      stock: p.stock,
      rating: { rate: Math.round(rate * 10) / 10, count },
    };
  }

  getFeedback(id: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/product/ratings/${id}`);
  }
}
