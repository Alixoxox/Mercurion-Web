import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
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
export class Checkout {
  private userService = inject(UserService);
  private toast = inject(ToastrService);

  @ViewChild('successDialog') successDialog!: ElementRef<HTMLDialogElement>;

  orderNumber = '';
  totalAmount = 0;

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
    this.toast.success("Order Placed Successfully!")
    this.orderNumber = this.userService.generateOrderNumber();
    this.totalAmount = this.grandTotal();

    this.userService.clearCart();
    this.successDialog.nativeElement.showModal();
  }
}
