import { Component, computed, OnInit, inject, signal } from "@angular/core";
import { ProductService } from "../../../core/services/product.service";
import { Product } from "../../../shared/models/product";
import { ProductCard } from "../components/product-card";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { UserService } from "src/app/core/services/user.service";
import { ToastrService } from "ngx-toastr";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, ProductCard, FormsModule],
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

  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);
  sortBy = signal('default');
  currentPage = signal(1);
  categories = signal<string[]>([]);
  categoryOpen = signal(false);
  sortOpen = signal(false);

  sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
  ];

  totalSpent = computed(() => {
    const user = this.userService.currentUser();
    if (!user) return 0;
    return user.cart.reduce((sum, item) => sum + item.price, 0);
  });

  filteredProducts = computed(() => {
    return this.products().filter(p => {
      const matchesSearch = !this.searchTerm() || p.title.toLowerCase().includes(this.searchTerm().toLowerCase());
      return matchesSearch;
    });
  });

  sortedProducts = computed(() => {
    const sorted = [...this.filteredProducts()];
    switch (this.sortBy()) {
      case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc': return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc': return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default: return sorted;
    }
  });

  totalPages = computed(() => {
    if (this.selectedCategory()) {
      return Math.max(1, Math.ceil(this.sortedProducts().length / this.PAGE_SIZE));
    }
    return Math.max(1, this.serverTotalPages());
  });

  paginatedProducts = computed(() => {
    if (!this.selectedCategory()) {
      return this.sortedProducts();
    }
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.sortedProducts().slice(start, start + this.PAGE_SIZE);
  });

  readonly PAGE_SIZE = 8;
  private readonly MIN_LOADING_MS = 800;
  serverTotalPages = signal(1);
  private loadedCategory = signal<string | null | undefined>(undefined);

  ngOnInit(): void {
    localStorage.getItem('loggedIn') === 'true' ? this.userService.loggedIn.set(true) : this.userService.loggedIn.set(false)
    this.loadProducts();

    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
    });
  }

  private loadProducts(): void {
    const startTime = Date.now();
    const done = () => this.delayLoadingDone(startTime);
    const category = this.selectedCategory();

    if (category) {
      this.productService.getByCategory(category).subscribe({
        next: (data) => {
          this.products.set(data);
          this.loadedCategory.set(category);
          this.userService.seedWishlist(data);
          done();
        },
        error: () => {
          this.error.set("Failed to load products. Please try again.");
          done();
        },
      });
      return;
    }

    this.productService.getAll(this.currentPage() - 1, this.PAGE_SIZE).subscribe({
      next: (res) => {
        this.products.set(res.content);
        this.serverTotalPages.set(res.totalPages);
        this.loadedCategory.set(null);
        this.userService.seedWishlist(res.content);
        done();
      },
      error: () => {
        this.error.set("Failed to load products. Please try again.");
        done();
      },
    });
  }

  private delayLoadingDone(startTime: number): void {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, this.MIN_LOADING_MS - elapsed);
    setTimeout(() => this.loading.set(false), remaining);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    if (this.loadedCategory() !== this.selectedCategory()) {
      this.loadProducts();
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set(null);
    this.sortBy.set('default');
    this.currentPage.set(1);
    this.loadProducts();
  }

  getSortLabel(): string {
    return this.sortOptions.find(o => o.value === this.sortBy())?.label || 'Default';
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      if (!this.selectedCategory()) {
        this.loadProducts();
      }
    }
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

  onToggleLike(product: Product): void {
    if (!this.userService.loggedIn()) {
      this.router.navigate(['auth/login']);
      this.toast.error('Please login to like products');
      return;
    }
    this.userService.toggleWishlist(product.id);
  }
}