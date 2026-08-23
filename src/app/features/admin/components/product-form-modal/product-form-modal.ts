import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AdminProductService } from '../../../../core/services/admin-product.service';
import { Product } from '../../../../shared/models/product';
import { ProductService } from 'src/app/core/services/product.service';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './product-form-modal.html',
})
export class ProductFormModal implements OnInit {
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<{ tempBlobUrl?: string; title?: string; id?: number }>();

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    image: [''],
    description: ['', [Validators.maxLength(254)]],
  });

  selectedImage = signal<File | null>(null);
  selectedImageUrl = signal<string | null>(null);
  pendingLocalProductImage = signal<string | null>(null);
  categoryOpen = signal(false);
  saving = false;
  previewImage: string | null = null;

  constructor(private fb: FormBuilder, private adminService: AdminProductService, private productService: ProductService) {}
  private toast = inject(ToastrService);
  categories = this.productService.categories();

  ngOnInit(): void {
    if (this.product) {
      this.form.patchValue({
        title: this.product.title,
        price: this.product.price,
        stock: this.product.stock,
        category: new TitleCasePipe().transform(this.product.category),
        image: this.product.image,
        description: this.product.description ?? '',
      });
    }
  }

  selectCategory(cat: string): void {
    this.form.patchValue({ category: cat });
    this.form.get('category')?.markAsTouched();
    this.categoryOpen.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    const v = this.form.getRawValue();

    const payload = {
      title: v.title.trim(),
      price: Number(v.price),
      stock: Number(v.stock),
      category: v.category.trim().toUpperCase(),
      image: this.selectedImage() ? '' : (v.image ?? '').trim(),
      description: (v.description ?? '').trim(),
    };

    const localImageUrl = this.selectedImageUrl();
    if (localImageUrl) {
      this.pendingLocalProductImage.set(localImageUrl);
    }

    this.saving = true;
    const request = this.product
      ? this.adminService.update({ ...this.product, ...payload }, this.selectedImage())
      : this.adminService.create(payload, this.selectedImage());

    request.subscribe({
      next: (message: string) => {
        this.saving = false;
        this.toast.success(message?.trim() || 'Product saved');

        const localBlob = this.selectedImageUrl();
        const currentEditing = this.product;

        this.selectedImage.set(null);
        this.selectedImageUrl.set(null);
        this.pendingLocalProductImage.set(null);
        this.previewImage = null;

        this.saved.emit({
          tempBlobUrl: localBlob ?? undefined,
          title: v.title.trim(),
          id: currentEditing?.id
        });
      },
      error: (err) => {
        this.saving = false;
        this.pendingLocalProductImage.set(null);

        const body = (err as HttpErrorResponse)?.error;
        const message = typeof body === 'string' && body
          ? body
          : (body as { message?: string } | null)?.message ?? 'Failed to save product';
        this.toast.error(message, 'Error');
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file && !file.type.startsWith("image/")) {
      this.toast.error("Please select an image file", "Invalid File", { timeOut: 2000, progressBar: true });
      input.value = "";
      return;
    }

    const oldUrl = this.selectedImageUrl();
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }

    this.selectedImage.set(file);

    if (file) {
      const blobUrl = URL.createObjectURL(file);
      this.selectedImageUrl.set(blobUrl);
      this.previewImage = blobUrl;
    } else {
      this.selectedImageUrl.set(null);
      this.previewImage = null;
    }
  }
}