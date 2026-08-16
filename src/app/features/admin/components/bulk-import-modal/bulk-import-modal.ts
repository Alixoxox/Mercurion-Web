import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AdminProductService } from '../../../../core/services/admin-product.service';

@Component({
  selector: 'app-bulk-import-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-import-modal.html',
})
export class BulkImportModal {
  @Output() close = new EventEmitter<void>();
  @Output() imported = new EventEmitter<void>();

  fileName = signal('');
  dragging = signal(false);
  uploading = signal(false);

  constructor(private adminService: AdminProductService, private toast: ToastrService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.upload(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.upload(file);
  }

  private upload(file: File): void {
    this.fileName.set(file.name);
    this.uploading.set(true);
    this.adminService.bulkUpload(file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.toast.success('Products imported');
        this.imported.emit();
      },
      error: (err) => {
        this.uploading.set(false);
        const message = typeof err.error === 'string' ? err.error : err.error?.message;
        this.toast.error(message || 'Import failed. Please try again.');
      },
    });
  }
}