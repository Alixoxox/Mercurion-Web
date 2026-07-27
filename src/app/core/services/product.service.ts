import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Product } from '../../shared/models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private categories$? : Observable<string[]>;
  private products$? : Observable<Product[]>
  //caching -> shareReplay v16 - or - v19+ httpResource
  getAll(): Observable<Product[]> {
    if(!this.products$){
    this.products$ = this.http.get<Product[]>('https://fakestoreapi.com/products').pipe(
      shareReplay(1) //last emitted value
    );
  }
  return this.products$;
}

  getById(id: number): Observable<Product | undefined> {
    return this.http.get<Product>(`https://fakestoreapi.com/products/${id}`);
  }

  getCategories(): Observable<string[]> {
    if(!this.categories$){
    this.categories$= this.http.get<string[]>('https://fakestoreapi.com/products/categories').pipe(
      shareReplay(1)
    );
  }
  return this.categories$
}

  getByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`https://fakestoreapi.com/products/category/${category}`);
  }
}
