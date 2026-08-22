import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminProductService } from '../../../../core/services/admin-product.service';
import { Product } from '../../../../shared/models/product';
import { ProductFormModal } from '../../components/product-form-modal/product-form-modal';
import { BulkImportModal } from '../../components/bulk-import-modal/bulk-import-modal';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductFormModal, BulkImportModal],
  templateUrl: './admin-products.html',
})
export class AdminProducts {
  private adminService = inject(AdminProductService);
  private toast = inject(ToastrService);

  searchTerm = signal('');
  private searchDebounce?: ReturnType<typeof setTimeout>;

  products = this.adminService.products;
  loading = this.adminService.loading;
  totalElements = this.adminService.totalElements;

  currentPage = computed(() => this.adminService.page() + 1);
  totalPages = computed(() => Math.max(1, this.adminService.totalPages()));

  localProductImages = signal<Record<number, string>>({});
  showForm = signal(false);
  editingProduct = signal<Product | null>(null);
  showBulk = signal(false);

  recentlyCreatedId = signal<number | null>(null);
  private pendingCreate: { title: string; blobUrl?: string } | null = null;

  constructor() {
    effect(() => {
      const list = this.products();
      if (!this.pendingCreate) return;

      const match = list.find(p => p.title === this.pendingCreate!.title);
      if (match) {
        if (this.pendingCreate!.blobUrl) {
          this.localProductImages.update(map => ({ ...map, [match.id]: this.pendingCreate!.blobUrl! }));
        }
        this.recentlyCreatedId.set(match.id);
        this.pendingCreate = null;
      }
    }, { allowSignalWrites: true });
  }

  orderedProducts = computed(() => {
    const list = this.products();
    const pinnedId = this.recentlyCreatedId();
    if (pinnedId == null) return list;

    const idx = list.findIndex(p => p.id === pinnedId);
    if (idx <= 0) return list;
    return [list[idx], ...list.slice(0, idx), ...list.slice(idx + 1)];
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > total) {
      end = total;
      start = end - maxVisible + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  rangeLabel = computed(() => {
    const total = this.totalElements();
    if (total === 0) return 'No products';
    const size = this.adminService.pageSize();
    const start = (this.currentPage() - 1) * size + 1;
    const end = Math.min(this.currentPage() * size, total);
    return `Showing ${start}-${end} of ${total} products`;
  });

  ngOnInit(): void {
    this.adminService.load(0);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.adminService.setSearch(value.trim());
    }, 350);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.adminService.goToPage(page - 1);
  }

  openCreate(): void {
    this.editingProduct.set(null);
    this.showForm.set(true);
  }

  openEdit(p: Product): void {
    this.editingProduct.set(p);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }

  onSaved(event?: { tempBlobUrl?: string; title?: string; id?: number }): void {
    if (event?.tempBlobUrl) {
      if (event.id) {
        this.localProductImages.update(map => ({ ...map, [event.id!]: event.tempBlobUrl! }));
        this.recentlyCreatedId.set(event.id);
      } else if (event.title) {
        this.pendingCreate = { title: event.title, blobUrl: event.tempBlobUrl };
      }
    } else if (event?.id) {
      this.recentlyCreatedId.set(event.id);
    }
    this.closeForm();
  }

  changeStock(p: Product, delta: number): void {
    this.adminService.updateStock(p.id, delta).subscribe({
      next: () => this.toast.info('Stock updated'),
      error: () => this.toast.error('Failed to update stock'),
    });
  }

  deleteProduct(p: Product): void {
    if (!confirm(`Delete "${p.title}"?`)) return;
    this.adminService.delete(p.id).subscribe({
      next: () => this.toast.success('Product deleted'),
      error: () => this.toast.error('Failed to delete product'),
    });
  }
}