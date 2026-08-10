import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { user, AuthResponse } from '../../shared/models/userDTO.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  token = signal<string | null>(localStorage.getItem('token'));
  users: user[] = []
  loggedIn = signal(false);
  constructor() {
    this.getUsers();
    const loggedIn = localStorage.getItem('loggedIn') === 'true'; //ts status
    if (loggedIn) {
      this.loggedIn.set(true);
      try {
        const saved = JSON.parse(localStorage.getItem('loggedInUser') || 'null'); //ts info bout user
        if (saved) this.currentUser.set(saved);
      } catch {}
    }
  }
  usersCount = signal(0);
  route=inject(Router);
  currentUser = signal<user | null>(null);
  cartCount = computed(() => this.currentUser()?.cart.length ?? 0);
  private generateId(){
    return this.users.length > 0
      ? Math.max(...this.users.map(user => user.id)) + 1
      : 1;
  }
  add(userModel: user) {
    userModel.id = this.generateId();
    this.users.push(userModel);
    this.usersCount.update(count => count + 1);
    localStorage.setItem('users', JSON.stringify(this.users));
  }
  getUsers() {
    try {
      this.users = JSON.parse(localStorage.getItem('users') || '[]');
    } catch {
      this.users = [];
      localStorage.removeItem('users');
    }
    this.usersCount.set(this.users.length);
  }
  addToCart(product: any) {
    const user=this.currentUser()
    if (!user) {
      this.route.navigate(['auth/login']);
      return;
    }
    const updated = { ...user, cart: [...user.cart, product] };
    this.currentUser.set(updated);

    let idx=this.users.findIndex(u => u.id === user.id);
    if(idx !== -1){
      this.users[idx] = updated;
    }
    localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('loggedInUser', JSON.stringify(updated));

}
  deleteFromCart(productId: number) {
  const user=this.currentUser()
  if (!user) {
    this.route.navigate(['auth/login']);
    return;
  }
  const updated = { ...user, cart: user.cart.filter(p => p.id !== productId) };
  this.currentUser.set(updated);
  let idx=this.users.findIndex(u => u.id === user.id);
  if(idx !== -1){
    this.users[idx] = updated;
  }
      localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('loggedInUser', JSON.stringify(updated));
}

  removeOneFromCart(productId: number) {
    const user = this.currentUser()
    if (!user) return;
    const idx = user.cart.findIndex(p => p.id === productId);
    if (idx === -1) return;
    const newCart = [...user.cart];
    newCart.splice(idx, 1);
    const updated = { ...user, cart: newCart };
    this.currentUser.set(updated);
    let userIdx = this.users.findIndex(u => u.id === user.id);
    if (userIdx !== -1) {
      this.users[userIdx] = updated;
    }
    localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('loggedInUser', JSON.stringify(updated));
  }

  clearCart() {
    const user = this.currentUser()
    if (!user) return;
    const updated = { ...user, cart: [] };
    this.currentUser.set(updated);
    let userIdx = this.users.findIndex(u => u.id === user.id);
    if (userIdx !== -1) {
      this.users[userIdx] = updated;
    }
    localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('loggedInUser',JSON.stringify(this.currentUser));
  }

  generateOrderNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ORD-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  setAuthenticated(user: user, token: string) {
    this.currentUser.set(user);
    this.loggedIn.set(true);
    this.token.set(token);
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    localStorage.setItem('token', token);
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${process.env['NG_APP_API_URL']}/users/auth/register`, { name, email, password });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${process.env['NG_APP_API_URL']}/users/auth/login`, { email, password });
  }

  logout() {
    this.loggedIn.set(false);
    this.currentUser.set(null);
    this.token.set(null);
    this.wishlistIds.set(new Set());
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
    this.route.navigate(['auth/login']);
  }

  wishlistIds = signal<Set<number>>(new Set());

  isWishlisted(productId: number): boolean {
    return this.wishlistIds().has(productId);
  }

  seedWishlist(products: { id: number; wishlistedBy?: { id: number; userId?: number }[] }[]): void {
    const userId = this.currentUser()?.id;
    if (userId == null) {
      this.wishlistIds.set(new Set());
      return;
    }
    this.wishlistIds.set(
      new Set(
        products
          .filter(p => p.wishlistedBy?.some(w => (w.userId ?? w.id) === userId))
          .map(p => p.id)
      )
    );
  }

  toggleWishlist(productId: number): void {
    if (!this.loggedIn() || !this.token()) {
      this.route.navigate(['auth/login']);
      return;
    }

    const current = this.wishlistIds();
    const next = new Set(current);
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    this.wishlistIds.set(next);

    this.http
      .post(`${process.env['NG_APP_API_URL']}/users/mark/wishlist/${productId}`, null, { responseType: 'text' })
      .subscribe({
        error: () => {
          this.wishlistIds.set(current);
        },
      });
  }
}