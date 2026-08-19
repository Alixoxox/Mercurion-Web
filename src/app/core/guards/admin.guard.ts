import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const adminGuard = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  if (userService.loggedIn() && userService.currentUser()?.role === 'ADMIN') return true;
  return router.parseUrl('admin/login');
};