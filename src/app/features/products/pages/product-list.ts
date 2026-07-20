import { Component, computed, OnInit, inject, signal } from "@angular/core";
import { ProductService } from "../../../core/services/product.service";
import { Product } from "../../../shared/models/product";
import { ProductCard } from "../components/product-card";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { UserService } from "src/app/core/services/user.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: "./product-list.html",
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private router=inject(Router);
  public userService=inject(UserService);

  toast = inject(ToastrService);
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  totalSpent = computed(() => {
    const user = this.userService.currentUser();
    if (!user) return 0;
    return user.cart.reduce((sum, item) => sum + item.price, 0);
  });

  ngOnInit(): void {
    localStorage.getItem('loggedIn') === 'true' ? this.userService.loggedIn.set(true) : this.userService.loggedIn.set(false)
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Failed to load products. Please try again.");
        this.loading.set(false);
      },
    });
  }

  onAddToCart(product: Product): void {
    if(!this.userService.loggedIn()){
      this.router.navigate(['auth/login']);
      this.toast.error('Please login to add products to cart');
      return;
    }
    this.userService.addToCart(product);
    this.toast.info('Product added to cart', 'Success', { timeOut: 2000, progressBar: true });
  }

  isInCart(product: Product): boolean {
    const user = this.userService.currentUser();
  
    if (!user) return false;
  
    return user.cart.some(item => item.id === product.id);
  }

  deleteFromCart(product: Product): void {
    this.userService.deleteFromCart(product.id);
    this.toast.info('Product removed from cart', 'Success', { timeOut: 2000, progressBar: true });
  }
}