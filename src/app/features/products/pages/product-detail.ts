import { Component, OnChanges, SimpleChanges, computed, inject, signal, Input } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { ProductService } from "../../../core/services/product.service";
import { UserService } from "../../../core/services/user.service";
import { Product, Feedback } from "../../../shared/models/product";
import { CommonModule } from "@angular/common";
import { ProductCard } from "../components/product-card";
import { ToastrService } from "ngx-toastr";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCard, FormsModule],
  templateUrl: "./product-detail.html",
})
export class ProductDetail implements OnChanges {
  @Input() id?: string;
  private router = inject(Router);
  private productService = inject(ProductService);
  public userService = inject(UserService);
  localFeedbackImages = signal<Record<number, string>>({});
  private toast = inject(ToastrService);
  product = signal<Product | null | undefined>(undefined);
  relatedProducts = signal<Product[]>([]);
  loading = signal(true);
  relatedLoading = signal(false);
  error = signal<string | null>(null);
  feedback = signal<Feedback[]>([]);
  orderedFeedback = computed(() => {
    const user = this.userService.currentUser();
    if (!user) return this.feedback();
    const own = this.feedback().filter(f => f.userId === user.id);
    const others = this.feedback().filter(f => f.userId !== user.id);
    return [...own, ...others];
  });
  feedbackLoading = signal(false);
  myRating = signal(0);
  comment = signal("");
  selectedImage = signal<File | null>(null);
  selectedImageUrl = signal<string | null>(null);
  
  submitting = signal(false);
  editingFeedback = signal<Feedback | null>(null);
  private readonly MIN_LOADING_MS = 800;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {
      const id = Number(this.id);

      if (!id) {
        this.error.set("Product not found.");
        this.loading.set(false);
        return;
      }

      this.product.set(undefined);
      this.relatedProducts.set([]);
      this.feedback.set([]);
      this.myRating.set(0);
      this.comment.set("");
      this.selectedImage.set(null);
      this.loadProduct(id);
      this.loadFeedback();
    }
  }

  private loadProduct(id: number): void {
    const startTime = Date.now();

    this.productService.getById(id).subscribe({
      next: (data) => {
        if (Number(this.id) !== id) return;
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
    if (this.cartCount(product.id) >= product.stock) {
      this.toast.info('No more stock available', 'Cart', { timeOut: 2000, progressBar: true });
      return;
    }
    this.userService.addToCart(product);
    this.toast.info("Product added to cart", "Success", { timeOut: 2000, progressBar: true });
  }

  cartCount(productId: number): number {
    return this.userService.currentUser()?.cart.filter(i => i.id === productId).length ?? 0;
  }

  isStockLimitReached(product: Product): boolean {
    return product.stock > 0 && this.cartCount(product.id) >= product.stock;
  }

  deleteFromCart(product: Product): void {
    this.userService.removeOneFromCart(product.id);
    this.toast.info("Item removed from cart", "Success", { timeOut: 2000, progressBar: true });
  }

  isInCart(product: Product): boolean {
    return this.userService.currentUser()?.cart.some(item => item.id === product.id) ?? false;
  }

  canReview = () => {
    const user = this.userService.currentUser();
    return !!user && !this.feedback().some(f => f.userId === user.id);
  };
  loadFeedback(): void {
    const id = Number(this.id);
    if (!id) return;
  
    this.feedbackLoading.set(true);
  
    this.productService.getFeedback(id).subscribe({
      next: (data) => {
        if (Number(this.id) !== id) return;
      
        const feedback = data ?? [];
        const pendingImage = this.pendingLocalFeedbackImage();
        const currentUserId = this.userService.currentUser()?.id;
      
        let newLocalImages = {
          ...this.localFeedbackImages()
        };
      
        if (pendingImage && currentUserId) {
          const myFeedback = feedback.find(
            f => f.userId === currentUserId && !f.feedbackImage
          );
      
          if (myFeedback?.id) {
            newLocalImages[myFeedback.id] = pendingImage;
            this.localFeedbackImages.set(newLocalImages);
      
            this.pendingLocalFeedbackImage.set(null);
          }
        }
      
        this.feedback.set(
          feedback.map(f => ({
            ...f,
            feedbackImage:
              f.feedbackImage ||
              newLocalImages[f.id]
          }))
        );
      },
  
      error: () => {
        if (Number(this.id) === id) {
          this.feedback.set([]);
        }
      },
  
      complete: () => {
        if (Number(this.id) === id) {
          this.feedbackLoading.set(false);
        }
      },
    });
  }
  refreshProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (data) => {
        if (Number(this.id) === id && data) this.product.set(data);
      },
    });
  }

  setRating(value: number): void {
    this.myRating.set(value);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
  
    if (file && !file.type.startsWith("image/")) {
      this.toast.error("Please select an image file", "Invalid File", {
        timeOut: 2000,
        progressBar: true
      });
  
      input.value = "";
      return;
    }
  
    // Revoke previous preview URL
    const oldUrl = this.selectedImageUrl();
  
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }
  
    this.selectedImage.set(file);
  
    if (file) {
      this.selectedImageUrl.set(URL.createObjectURL(file));
    } else {
      this.selectedImageUrl.set(null);
    }
  }
  pendingLocalFeedbackImage = signal<string | null>(null);
  submitFeedback(): void {
    const productId = this.product()?.id;
    const user = this.userService.currentUser();
  
    if (!productId || !user || this.submitting()) return;
  
    if (!this.myRating()) {
      this.toast.error(
        'Please select a star rating',
        'Validation Error',
        {
          timeOut: 2000,
          progressBar: true
        }
      );
      return;
    }
  
    const localImageUrl = this.selectedImageUrl();
  
    if (localImageUrl) {
      this.pendingLocalFeedbackImage.set(localImageUrl);
    }
  
    this.submitting.set(true);
  
    this.userService
      .rateProduct(
        productId,
        this.myRating(),
        this.comment().trim(),
        this.selectedImage()
      )
      .subscribe({
        next: (message: string) => {
          this.toast.success(
            message?.trim() || 'Feedback submitted successfully!',
            'Success',
            {
              timeOut: 2000,
              progressBar: true
            }
          );
  
          this.myRating.set(0);
          this.comment.set("");
          this.selectedImage.set(null);
          this.selectedImageUrl.set(null);
  
          this.loadFeedback();
          this.refreshProduct(productId);
        },
  
        error: (err) => {
          this.pendingLocalFeedbackImage.set(null);
  
          if (err.status === 403) return;
  
          const message =
            typeof err.error === 'string'
              ? err.error
              : err.error?.message;
  
          this.toast.error(
            message || 'Failed to submit feedback. Please try again.',
            'Error',
            {
              timeOut: 3000,
              progressBar: true
            }
          );
        },
  
        complete: () => {
          this.submitting.set(false);
        }
      });
  }
  deleteFeedback(f: Feedback): void {
    const user = this.userService.currentUser();
    if (!f.id || !user || f.userId !== user.id) return;
  
    this.userService.removeRating(f.id).subscribe({
      next: () => {
        this.toast.success('Your feedback was deleted.', 'Success', { timeOut: 2000, progressBar: true });
        this.feedback.set(this.feedback().filter(feed => feed.id !== f.id));
      },
      error: () => {
        this.toast.error('Could not delete feedback.', 'Error', { timeOut: 2000 });
      }
    });
  }

  editFeedback(f: Feedback): void {
    this.editingFeedback.set(f);
    this.myRating.set(f.value);
    this.comment.set(f.comment ?? "");
    this.selectedImage.set(null);
  }

  cancelEdit(): void {
    this.editingFeedback.set(null);
    this.myRating.set(0);
    this.comment.set("");
    this.selectedImage.set(null);
  }

  updateFeedback(): void {
    const product = this.product();
    const current = this.editingFeedback();
    if (!product || !current || this.submitting()) return;

    if (!this.myRating()) {
      this.toast.error('Please select a star rating', 'Validation Error', { timeOut: 2000, progressBar: true });
      return;
    }

    this.submitting.set(true);
    this.userService.updateRating(current.id, this.myRating(), this.comment().trim(), this.selectedImage()).subscribe({
      next: (message: string) => {
        this.toast.success(message?.trim() || 'Feedback updated successfully!', 'Success', { timeOut: 2000, progressBar: true });
        this.cancelEdit();
        this.loadFeedback();
        this.refreshProduct(product.id);
      },
      error: (err) => {
        if (err.status === 403) return;
        const message = typeof err.error === 'string' ? err.error : err.error?.message;
        this.toast.error(message || 'Failed to update feedback. Please try again.', 'Error', { timeOut: 3000, progressBar: true });
      },
      complete: () => this.submitting.set(false),
    });
  }

  ngOnDestroy(): void {
    const url = this.selectedImageUrl();
    if (url) URL.revokeObjectURL(url);
  }
}
