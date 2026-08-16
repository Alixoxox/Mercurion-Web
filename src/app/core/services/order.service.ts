import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { OrderItem, OrderStatus, PastOrder } from '../../shared/models/order';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = process.env['NG_APP_API_URL'];

  getHistory(): Observable<PastOrder[]> {
    return this.http.get<PastOrder[]>(`${this.apiUrl}/orders/history`);
  }

  getAllOrders(): Observable<PastOrder[]> {
    return this.http
      .get<PageResponse<PastOrder>>(`${this.apiUrl}/orders/all`, {
        params: { page: '0', size: '1000' },
      })
      .pipe(map((page) => page.content));
  }

  getOrderItems(historyId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.apiUrl}/orders/history/bought/${historyId}`);
  }

  updateStatus(id: number, status: OrderStatus): Observable<PastOrder> {
    return this.http.put<PastOrder>(`${this.apiUrl}/orders/status/${id}`, { status });
  }
}