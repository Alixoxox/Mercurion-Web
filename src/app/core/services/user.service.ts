import { Injectable, signal } from '@angular/core';
import { user } from '../../shared/models/userDTO.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  users: user[] = []
  loggedIn = signal(false);
  usersCount = signal(0);

  private generateId(){
    return this.users.length > 0
      ? Math.max(...this.users.map(user => user.id)) + 1
      : 1;
  }
  // create
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
}