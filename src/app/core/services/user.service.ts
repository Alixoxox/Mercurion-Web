import { computed, inject, Injectable, signal } from '@angular/core';
import { user } from '../../shared/models/userDTO.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
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

  logout() {
    this.loggedIn.set(false);
    this.currentUser.set(null);
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('loggedInUser');
    this.route.navigate(['auth/login']);
  }
}