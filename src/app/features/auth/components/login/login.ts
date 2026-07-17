import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { loginForm } from '../../../../shared/validators/authForms';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  
  constructor(public userService:UserService, public toastr: ToastrService, public router: Router) {}
  ngOnInit(): void {
    this.userService.getUsers()
  }
  loginForm = loginForm;
  onLogin() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    this.userService.loggedIn.set(this.userService.users.some(user => user.email === email && user.password === password));
    if(this.userService.loggedIn()){
      this.toastr.success('Login successful');
      this.router.navigate(['/products'])
    }else{
      this.toastr.error('Invalid email or password');
    }
  }
}
