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
      <a [routerLink]="['/products', product.id]" class="block shrink-0">
        <div class="aspect-square p-4 sm:p-6 flex items-center justify-center bg-white">
          <img [src]="product.image" [alt]="product.title" loading="lazy"
               class="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300" />
        </div>
      </a>
      <div class="p-4 border-t border-gray-100 flex-1 flex flex-col">
        <div class="flex items-start justify-between gap-2">
          <a [routerLink]="['/products', product.id]" class="min-w-0 flex flex-col">
            <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded self-start">
              {{ product.category }}
            </span>
            <h3 class="mt-2 text-sm font-medium text-gray-900 line-clamp-2 leading-snug hover:text-blue-600">
              {{ product.title }}
            </h3>
          </a>
          <button
            type="button"
            (click)="onLike($event)"
            [attr.aria-label]="isLiked ? 'Remove from wishlist' : 'Add to wishlist'"
            class="shrink-0 mt-0.5 rounded-full p-1.5 hover:bg-red-50 transition cursor-pointer">
            <svg
              [attr.fill]="isLiked ? 'currentColor' : 'none'"
              [class.text-red-500]="isLiked"
              [class.text-gray-400]="!isLiked"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>
        <div class="mt-auto pt-2 flex items-center justify-between">
          <a [routerLink]="['/products', product.id]" class="text-lg font-bold text-gray-900 hover:text-blue-600">
            {{ product.price | currency }}
          </a>
          <span class="text-xs text-gray-500">★ {{ product.rating.rate }} ({{ product.rating.count }})</span>
        </div>
      </div>
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
      *ngIf="product.stock === 0 || isStockLimitReached"
      disabled
      class="flex-1 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg cursor-not-allowed">
      Out of Stock
    </button>

    <button
      *ngIf="product.stock > 0 && !isStockLimitReached"
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
  @Input() isLiked = false;
  @Input() isStockLimitReached = false;
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() deleteFromCart = new EventEmitter<Product>();
  @Output() like = new EventEmitter<Product>();

  onLike(event: Event): void {
    event.stopPropagation();
    this.like.emit(this.product);
  }
}