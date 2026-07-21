import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ProductService } from "../../../core/services/product.service";
import { UserService } from "../../../core/services/user.service";
import { Product } from "../../../shared/models/product";
import { CommonModule } from "@angular/common";
import { ProductCard } from "../components/product-card";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCard],
  templateUrl: "./product-detail.html",
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  public userService = inject(UserService);
  private toast = inject(ToastrService);
  product = signal<Product | null | undefined>(undefined);
  relatedProducts = signal<Product[]>([]);
  loading = signal(true);
  relatedLoading = signal(false);
  error = signal<string | null>(null);

  private readonly MIN_LOADING_MS = 800;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    const startTime = Date.now();

    if (!id) {
      this.error.set("Product not found.");
      this.loading.set(false);
      return;
    }

    this.productService.getById(id).subscribe({
      next: (data) => {
        this.product.set(data ?? null);
        this.delayLoadingDone(startTime);
        if (data) {
          this.loadRelated(data.category);
        }
      },
      error: () => {
        this.error.set("Failed to load product. Please try again.");
        this.delayLoadingDone(startTime);
      },
    });
  }

  private delayLoadingDone(startTime: number): void {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, this.MIN_LOADING_MS - elapsed);
    setTimeout(() => this.loading.set(false), remaining);
  }

  private loadRelated(category: string): void {
    this.relatedLoading.set(true);
    this.productService.getByCategory(category).subscribe({
      next: (data) => {
        const currentId = this.product()?.id;
        this.relatedProducts.set(data.filter(p => p.id !== currentId).slice(0, 4));
        this.relatedLoading.set(false);
      },
      error: () => {
        this.relatedLoading.set(false);
      },
    });
  }

  onAddToCart(product: Product): void {
    if (!this.userService.loggedIn()) {
      this.router.navigate(["auth/login"]);
      this.toast.error("Please login to add products to cart");
      return;
    }
    this.userService.addToCart(product);
    this.toast.info("Product added to cart", "Success", { timeOut: 2000, progressBar: true });
  }

  deleteFromCart(product: Product): void {
    this.userService.deleteFromCart(product.id);
    this.toast.info("Product removed from cart", "Success", { timeOut: 2000, progressBar: true });
  }

  isInCart(product: Product): boolean {
    return this.userService.currentUser()?.cart.some(item => item.id === product.id) ?? false;
  }
}
