import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { loginForm } from '../../../../shared/validators/authForms';
import { UserService } from '../../../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  
  constructor(public userService:UserService, public toastr: ToastrService, public router: Router) {}
  loginForm = loginForm;
  isLoading = false;
  isAdmin = false;

  ngOnInit(): void {
    this.checkAdmin();
  }

  checkAdmin(){ 
  if (this.router.url.includes('admin/login')) {
    this.isAdmin=true;
  }
  }

  onLogin() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    if (!email || !password) return;
    this.isLoading = true;

    this.userService.login(email, password, this.isAdmin).subscribe({
      next: (res) => {
        const user = {
          id: res.UserData.id,
          name: res.UserData.name,
          email: res.UserData.email,
          password: '',
          role: this.isAdmin ? 'ADMIN' : res.UserData.role,
          cart: []
        };
        this.userService.setAuthenticated(user, res.Token);
        this.userService.fetchWishlist();
        this.toastr.success('Login successful');
        this.router.navigate(this.isAdmin ? ['/admin'] : ['/products']);
      },
      error: (err) => {
        this.isLoading = false;
        const message = typeof err.error === 'string' ? err.error : err.error?.message;
        this.toastr.error(message || 'Login failed. Please try again.');
      }
    });
  }
}
