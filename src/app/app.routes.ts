import { Routes } from '@angular/router';
import { AuthPage } from './features/auth/auth-page';
import { Login } from './features/auth/components/login/login';
import { Signup } from './features/auth/components/signup/signup';
import { About } from './features/about/about';
import { Contact } from './features/contact/contact';
import { Cart } from './features/cart/cart';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthPage,
    children: [
      { path: 'login', component: Login },
      { path: 'signup', component: Signup },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'cart', component: Cart },
  { path: '**', redirectTo: 'auth/login' }
];
