import { Routes } from '@angular/router';
import { AuthPage } from './features/auth/auth-page';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthPage,
    children: [
      { path: 'login',loadComponent: () => import('./features/auth/components/login/login').then(m => m.Login) },
      { path: 'signup', loadComponent: () => import('./features/auth/components/signup/signup').then(m => m.Signup) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  { path: 'products', loadComponent: () => import('./features/products/pages/product-list').then(m => m.ProductList) },
  { path: 'products/:id', loadComponent: () => import('./features/products/pages/product-detail').then(m => m.ProductDetail) },
  { path: 'about', loadComponent: () => import('./features/about/about').then(m => m.About)},
  { path: 'contact', loadComponent: () => import('./features/contact/contact').then(m => m.Contact)},
  { path: 'cart', loadComponent: () => import('./features/cart/cart').then(m => m.Cart), canActivate:[authGuard]},
  { path: 'history', loadComponent: () => import('./features/history/history').then(m => m.History), canActivate:[authGuard]},
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout').then(m => m.Checkout), canActivate:[authGuard]},
  {
    path: 'admin/login',
    component: AuthPage,
    children: [
      { path: '', loadComponent: () => import('./features/auth/components/login/login').then(m => m.Login) },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./features/admin/pages/admin-products/admin-products').then(m => m.AdminProducts),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./features/admin/pages/admin-orders/admin-orders').then(m => m.AdminOrders),
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: 'products' }
];
