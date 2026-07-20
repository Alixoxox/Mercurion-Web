import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { CurrencyPipe, NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Product } from "../../../shared/models/product";

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgIf],
  host: { class: "block h-full" },
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group h-full flex flex-col">
      <a [routerLink]="['/products', product.id]" class="flex-1 flex flex-col">
        <div class="aspect-square p-6 flex items-center justify-center bg-white">
          <img [src]="product.image" [alt]="product.title"
               class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div class="p-4 border-t border-gray-100 flex-1 flex flex-col">
          <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded self-start">
            {{ product.category }}
          </span>
          <h3 class="mt-2 text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {{ product.title }}
          </h3>
          <div class="mt-auto pt-2 flex items-center justify-between">
            <span class="text-lg font-bold text-gray-900">{{ product.price | currency }}</span>
            <span class="text-xs text-gray-500">★ {{ product.rating.rate }} ({{ product.rating.count }})</span>
          </div>
        </div>
      </a>
      <div class="px-4 pb-4">
  <div class="flex gap-2">

    <ng-container *ngIf="isLoggedIn && isInCart">
      <button
        (click)="deleteFromCart.emit(product)"
        class="flex-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg transition cursor-pointer">
        Remove
      </button>
    </ng-container>

    <button
      (click)="addToCart.emit(product)"
      [class.flex-1]="isLoggedIn && isInCart"
      [class.w-full]="!(isLoggedIn && isInCart)"
      class="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition cursor-pointer">
      Add to Cart
    </button>

  </div>
</div>
    </div>
  `,
})
export class ProductCard {
  @Input() isLoggedIn = false;
  @Input() isInCart = false;
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() deleteFromCart = new EventEmitter<Product>();
}