import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Footer],
  templateUrl: './app.html',
})
export class App {

  protected readonly title = signal('ecomerce-app');
  protected readonly isAdminRoute = signal(false);

  constructor() {
    const router = inject(Router);
    this.isAdminRoute.set(router.url.startsWith('/admin'));
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
      }
    });
  }
}
