import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { checkoutForm as checkoutFormGroup } from '../../shared/validators/checkoutForms';
import { UserService } from '../../core/services/user.service';
import { Product } from '../../shared/models/product';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit {
  private userService = inject(UserService);
  private toast = inject(ToastrService);

  @ViewChild('successDialog') successDialog!: ElementRef<HTMLDialogElement>;

  ngOnInit(): void {
    const user = this.userService.currentUser();
    if (user) {
      this.checkoutForm.patchValue({ fullName: user.name, email: user.email });
      this.checkoutForm.get('fullName')?.disable();
      this.checkoutForm.get('email')?.disable();
    }
  }
  orderNumber = '';
  totalAmount = 0;
  placing = signal(false);

  checkoutForm = checkoutFormGroup;

  cartItems = computed(() => {
    const cart = this.userService.currentUser()?.cart ?? [];
    const map = new Map<number, { product: Product; quantity: number }>();
    for (const item of cart) {
      const existing = map.get(item.id);
      if (existing) {
        existing.quantity++;
      } else {
        map.set(item.id, { product: item, quantity: 1 });
      }
    }
    return Array.from(map.values());
  });

  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  tax = computed(() => this.subtotal() * 0.05);

  grandTotal = computed(() => this.subtotal() + this.tax());

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toast.error('Please fill all required fields correctly', 'Validation Error', { timeOut: 2000, progressBar: true });
      return;
    }
    if (this.placing()) return;

    const payload = {
      phoneNumber: this.checkoutForm.get('phoneNumber')?.value ?? '',
      address: this.checkoutForm.get('address')?.value ?? '',
      city: this.checkoutForm.get('city')?.value ?? '',
      country: this.checkoutForm.get('country')?.value ?? '',
      postalCode: this.checkoutForm.get('postalCode')?.value ?? '',
      products: this.cartItems().map(item => ({ id: item.product.id, quantity: item.quantity })),
    };

    this.placing.set(true);
    this.userService.purchaseOrder(payload).subscribe({
      next: (order: any) => {
        this.placing.set(false);
        this.orderNumber = order?.id ? String(order.id) : this.userService.generateOrderNumber();
        this.totalAmount = order?.totalAmount ?? this.grandTotal();
        this.userService.clearCart();
        this.successDialog.nativeElement.showModal();
      },
      error: (err) => {
        this.placing.set(false);
        const message = typeof err.error === 'string' ? err.error : 'Failed to place order. Please try again.';
        this.toast.error(message, 'Error', { timeOut: 3000, progressBar: true });
      },
    });
  }
}
