import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { OrderItem, OrderStatus, PastOrder } from '../../shared/models/order';

@Component({
  selector: 'app-history',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './history.html',
})
export class History implements OnInit {
  private orderService = inject(OrderService);

  @ViewChild('orderDialog') orderDialog!: ElementRef<HTMLDialogElement>;

  orders = signal<PastOrder[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedOrder = signal<PastOrder | null>(null);
  items = signal<OrderItem[]>([]);
  itemsLoading = signal(false);
  itemsError = signal(false);

  private statusStyles: Record<OrderStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    SHIPPED: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.error.set(null);
    this.orderService.getHistory().subscribe({
      next: (rows) => {
        this.orders.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load your orders. Please try again.');
      },
    });
  }

  openOrder(order: PastOrder): void {
    this.selectedOrder.set(order);
    this.items.set([]);
    this.itemsError.set(false);
    this.itemsLoading.set(true);
    this.orderDialog.nativeElement.showModal();
    this.orderService.getOrderItems(order.id).subscribe({
      next: (rows) => {
        this.items.set(rows);
        this.itemsLoading.set(false);
      },
      error: () => {
        this.itemsLoading.set(false);
        this.itemsError.set(true);
      },
    });
  }

  closeDialog(): void {
    this.orderDialog.nativeElement.close();
  }

  onDialogClick(event: MouseEvent): void {
    if (event.target === this.orderDialog.nativeElement) {
      this.closeDialog();
    }
  }

  statusClass(status: OrderStatus): string {
    return this.statusStyles[status] ?? 'bg-gray-100 text-gray-700';
  }
}