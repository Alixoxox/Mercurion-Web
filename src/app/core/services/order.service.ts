import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderItem, PastOrder } from '../../shared/models/order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = process.env['NG_APP_API_URL'];

  getHistory(): Observable<PastOrder[]> {
    return this.http.get<PastOrder[]>(`${this.apiUrl}/orders/history`);
  }

  getOrderItems(historyId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.apiUrl}/orders/history/bought/${historyId}`);
  }
}