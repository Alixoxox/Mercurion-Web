import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminProductService } from '../../../../core/services/admin-product.service';
import { Product } from '../../../../shared/models/product';

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
    description: [''],
  });

  categories = ['Electronics', 'Apparel', 'Home', 'Books', 'Sports', 'Beauty'];

  constructor(private fb: FormBuilder, private adminService: AdminProductService) {}

  ngOnInit(): void {
    if (this.product) {
      this.form.patchValue({
        title: this.product.title,
        price: this.product.price,
        stock: this.product.stock,
        category: this.product.category,
        image: this.product.image,
        description: this.product.description,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      title: v.title.trim(),
      price: Number(v.price),
      stock: Number(v.stock),
      category: v.category.trim(),
      image: v.image.trim() || 'https://picsum.photos/seed/placeholder/400',
      description: v.description.trim(),
    };
    if (this.product) {
      this.adminService.update({ ...this.product, ...payload });
    } else {
      this.adminService.create(payload);
    }
    this.saved.emit();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ image: String(reader.result ?? '') });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }
}