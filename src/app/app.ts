import { Component, inject, signal, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Footer],
  templateUrl: './app.html',
})
export class App implements OnInit {

  protected readonly title = signal('ecomerce-app');
  protected readonly isAdminRoute = signal(false);
  private readonly userService = inject(UserService);

  constructor() {
    const router = inject(Router);
    this.isAdminRoute.set(router.url.startsWith('/admin'));
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
      }
    });
  }

  ngOnInit(): void {
    if (this.userService.token() && !this.userService.isTokenValid()) {
      this.userService.logout();
    }
  }
}
