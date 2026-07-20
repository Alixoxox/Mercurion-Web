import { Component, inject, OnInit } from '@angular/core';
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
  ngOnInit(): void {
    this.userService.getUsers()
    console.log(this.userService.users)
  }
  loginForm = loginForm;
  onLogin() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
  
    const user = this.userService.users.find(
      user => user.email === email && user.password === password
    );
  
    if (user) {
      this.userService.loggedIn.set(true);
      this.userService.currentUser.set(user);
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      this.toastr.success('Login successful');
      this.router.navigate(['/products']);
    } else {
      this.userService.loggedIn.set(false);
      this.toastr.error('Invalid email or password');
    }
  }
}
