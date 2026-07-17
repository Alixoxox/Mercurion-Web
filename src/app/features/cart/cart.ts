import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
      <p class="text-gray-500">Your cart is empty.</p>
      <a routerLink="/products" class="inline-block mt-4 text-blue-600 hover:underline">Continue Shopping</a>
    </div>
  `,
})
export class Cart {}
