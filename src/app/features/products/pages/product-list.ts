import { Component, computed, ElementRef, HostListener, OnInit, OnDestroy, ViewChild, inject, signal } from "@angular/core";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from "rxjs";
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
export class ProductList implements OnInit, OnDestroy {
  public productService = inject(ProductService);
  private router = inject(Router);
  public userService = inject(UserService);

  toast = inject(ToastrService);
  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);
  sortBy = signal('default');
  currentPage = signal(1);
  categoryOpen = signal(false);
  sortOpen = signal(false);

  @ViewChild('categoryWrap') categoryWrap?: ElementRef<HTMLDivElement>;
  @ViewChild('sortWrap') sortWrap?: ElementRef<HTMLDivElement>;

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    const el = target as HTMLElement | null;
    if (!el) return;
    if (!this.categoryWrap?.nativeElement.contains(el)) this.categoryOpen.set(false);
    if (!this.sortWrap?.nativeElement.contains(el)) this.sortOpen.set(false);
  }

  sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
  ];

  readonly PAGE_SIZE = 8;
  private readonly MIN_LOADING_MS = 400;
  serverTotalPages = signal(1);
  serverTotalElements = signal(0);

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  totalSpent = computed(() => {
    const user = this.userService.currentUser();
    if (!user) return 0;
    return user.cart.reduce((sum, item) => sum + item.price, 0);
  });

  totalPages = computed(() => Math.max(1, this.serverTotalPages()));

  hasActiveFilters = computed(() =>
    !!this.searchTerm() || !!this.selectedCategory() || this.sortBy() !== 'default'
  );

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const window = 5;
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + window - 1);
    start = Math.max(1, end - window + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  rangeLabel = computed(() => {
    const total = this.serverTotalElements();
    if (!total) return '';
    const from = (this.currentPage() - 1) * this.PAGE_SIZE + 1;
    const to = Math.min(this.currentPage() * this.PAGE_SIZE, total);
    return `${from}–${to} of ${total}`;
  });

  ngOnInit(): void {
    localStorage.getItem('loggedIn') === 'true' ? this.userService.loggedIn.set(true) : this.userService.loggedIn.set(false);
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadProducts();
      });
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    const startTime = Date.now();
    this.loading.set(true);
    const sort = this.sortBy() === 'default' ? '' : this.sortBy();
    this.productService.getAll(
      this.currentPage() - 1,
      this.PAGE_SIZE,
      this.searchTerm().trim(),
      this.selectedCategory() ?? '',
      sort
    ).subscribe({
      next: (res) => {
        this.productService.products.set(res.content);
        this.serverTotalPages.set(res.totalPages ?? 1);
        this.serverTotalElements.set(res.totalElements ?? 0);
        this.error.set(null);
        this.userService.fetchWishlist();
        this.delayLoadingDone(startTime);
      },
      error: () => {
        this.error.set("Failed to load products. Please try again.");
        this.delayLoadingDone(startTime);
      },
    });
  }

  private delayLoadingDone(startTime: number): void {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, this.MIN_LOADING_MS - elapsed);
    setTimeout(() => this.loading.set(false), remaining);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.search$.next(value.trim());
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
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
      this.loadProducts();
    }
  }

  onAddToCart(product: Product): void {
    if(!this.userService.loggedIn()){
      this.router.navigate(['auth/login']);
      this.toast.error('Please login to add products to cart');
      return;
    }
    if (this.isStockLimitReached(product)) {
      this.toast.info('Out of stock', 'Cart', { timeOut: 2000, progressBar: true });
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

  isStockLimitReached(product: Product): boolean {
    if (product.stock <= 0) return false;
    const user = this.userService.currentUser();
    if (!user) return false;
    const count = user.cart.filter(item => item.id === product.id).length;
    return count >= product.stock;
  }

  deleteFromCart(product: Product): void {
    this.userService.removeOneFromCart(product.id);
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