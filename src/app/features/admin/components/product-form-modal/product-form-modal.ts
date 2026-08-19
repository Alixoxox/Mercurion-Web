import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
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
  @Output() saved = new EventEmitter<void>();

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    image: [''],
    description: ['', [Validators.maxLength(254)]],
  });

  saving = false;
  selectedImage: File | null = null;
  previewImage: string | null = null;

  constructor(private fb: FormBuilder, private adminService: AdminProductService, private productService : ProductService) {}
  private toast = inject(ToastrService);
  categories=this.productService.categories();
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

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    const v = this.form.getRawValue();
    const payload = {
      title: v.title.trim(),
      price: Number(v.price),
      stock: Number(v.stock),
      category: v.category.trim().toUpperCase(),
      image: this.selectedImage ? '' : (v.image ?? '').trim(),
      description: (v.description ?? '').trim(),
    };
    this.saving = true;
    const request = this.product
      ? this.adminService.update({ ...this.product, ...payload }, this.selectedImage)
      : this.adminService.create(payload, this.selectedImage);
    request.subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Product saved');
        this.saved.emit();
      },
      error: (err) => {
        this.saving = false;
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
    const file = input.files?.[0];
    if (!file) return;
    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = String(reader.result ?? '');
    };
    reader.readAsDataURL(file);
    input.value = '';
  }
}