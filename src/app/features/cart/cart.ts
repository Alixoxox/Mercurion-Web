import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { Product } from '../../shared/models/product';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CommonModule],
  standalone: true,
  templateUrl: './cart.html',
})
export class Cart {
  private userService = inject(UserService);
  private toast = inject(ToastrService);

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

  increaseQuantity(product: Product): void {
    const item = this.cartItems().find(i => i.product.id === product.id);
    const inCart = item?.quantity ?? 0;
    if (inCart >= product.stock) {
      this.toast.info('No more stock available', 'Cart', { timeOut: 1500, progressBar: true });
      return;
    }
    this.userService.addToCart(product);
    this.toast.info('Quantity increased', 'Cart', { timeOut: 1500, progressBar: true });
  }

  decreaseQuantity(productId: number): void {
    const item = this.cartItems().find(i => i.product.id === productId);
    if (!item) return;
    if (item.quantity === 1) {
      this.userService.deleteFromCart(productId);
      this.toast.info('Item removed from cart', 'Cart', { timeOut: 1500, progressBar: true });
    } else {
      this.userService.removeOneFromCart(productId);
      this.toast.info('Quantity decreased', 'Cart', { timeOut: 1500, progressBar: true });
    }
  }

  removeItem(productId: number): void {
    const item = this.cartItems().find(i => i.product.id === productId);
    if (!item) return;
    if (item.quantity === 1) {
      this.userService.deleteFromCart(productId);
    } else {
      this.userService.removeOneFromCart(productId);
    }
    this.toast.info('Item removed from cart', 'Cart', { timeOut: 1500, progressBar: true });
  }

  clearCart(): void {
    this.userService.clearCart();
    this.toast.info('Cart cleared', 'Cart', { timeOut: 1500, progressBar: true });
  }
}
