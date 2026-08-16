import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminProductService } from '../../../../core/services/admin-product.service';
import { Product } from '../../../../shared/models/product';
import { ProductFormModal } from '../../components/product-form-modal/product-form-modal';
import { BulkImportModal } from '../../components/bulk-import-modal/bulk-import-modal';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductFormModal, BulkImportModal],
  templateUrl: './admin-products.html',
})
export class AdminProducts {
  private adminService = inject(AdminProductService);
  private toast = inject(ToastrService);

  searchTerm = signal('');
  products = this.adminService.products;

  showForm = signal(false);
  editingProduct = signal<Product | null>(null);
  showBulk = signal(false);

  filteredProducts = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    if (!q) return this.products();
    return this.products().filter(
      p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.adminService.load();
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

  onSaved(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
    this.toast.success('Product saved');
  }

  changeStock(p: Product, delta: number): void {
    this.adminService.updateStock(p.id, delta);
    this.toast.info('Stock updated');
  }

  deleteProduct(p: Product): void {
    if (!confirm(`Delete "${p.title}"?`)) return;
    this.adminService.delete(p.id);
    this.toast.success('Product deleted');
  }
}