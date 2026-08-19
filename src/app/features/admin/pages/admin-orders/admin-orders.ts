import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '../../../../core/services/order.service';
import { OrderItem, OrderStatus, PastOrder } from '../../../../shared/models/order';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-orders.html',
})
export class AdminOrders implements OnInit {
  private orderService = inject(OrderService);
  private toast = inject(ToastrService);

  @ViewChild('orderDialog') orderDialog!: ElementRef<HTMLDialogElement>;

  orders = signal<PastOrder[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedOrder = signal<PastOrder | null>(null);
  items = signal<OrderItem[]>([]);
  itemsLoading = signal(false);
  itemsError = signal(false);

  selectedOrderLive = computed(() => {
    const sel = this.selectedOrder();
    if (!sel) return null;
    return this.orders().find((o) => o.id === sel.id) ?? sel;
  });

  statusFilter = signal<OrderStatus | 'ALL'>('ALL');
  updatingId = signal<number | null>(null);
  statusMenuId = signal<number | null>(null);

  readonly statuses: OrderStatus[] = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  private statusStyles: Record<OrderStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    SHIPPED: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  filteredOrders = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'ALL') return this.orders();
    return this.orders().filter((o) => o.status === filter);
  });

  countFor(status: OrderStatus | 'ALL'): number {
    if (status === 'ALL') return this.orders().length;
    return this.orders().filter((o) => o.status === status).length;
  }

  setFilter(status: OrderStatus | 'ALL'): void {
    this.statusFilter.set(status);
  }

  countClass(status: OrderStatus | 'ALL'): string {
    switch (status) {
      case 'PENDING':
        return 'text-amber-600';
      case 'SHIPPED':
        return 'text-blue-600';
      case 'DELIVERED':
        return 'text-green-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  }

  filterChipClass(status: OrderStatus | 'ALL'): string {
    if (this.statusFilter() === status) {
      return 'bg-gray-900 text-white';
    }
    return 'bg-transparent text-gray-500 hover:text-gray-900';
  }

  dotClass(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-400';
      case 'SHIPPED':
        return 'bg-blue-500';
      case 'DELIVERED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  }

  filterOptions(): (OrderStatus | 'ALL')[] {
    return ['ALL', ...this.statuses];
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);
    this.orderService.getAllOrders().subscribe({
      next: (rows) => {
        this.orders.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load orders. Please try again.');
      },
    });
  }

  toggleStatusMenu(id: number): void {
    this.statusMenuId.set(this.statusMenuId() === id ? null : id);
  }

  closeStatusMenu(): void {
    this.statusMenuId.set(null);
  }

  selectStatus(order: PastOrder, status: OrderStatus): void {
    this.statusMenuId.set(null);
    if (status === order.status) return;
    this.updatingId.set(order.id);
    this.orderService.updateStatus(order.id, status).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.toast.success(`Order ${order.id} marked as ${status}`, 'Status updated');
        this.orders.update((list) =>
          list.map((o) => (o.id === order.id ? { ...o, status } : o))
        );
      },
      error: () => {
        this.updatingId.set(null);
        this.toast.error('Failed to update order status. Please try again.');
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