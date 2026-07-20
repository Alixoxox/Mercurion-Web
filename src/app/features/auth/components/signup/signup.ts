import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { signupForm } from '../../../../shared/validators/authForms';
import { UserService } from '../../../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterLink],
  templateUrl: './signup.html',
})
export class Signup {
  constructor(private userService: UserService,public toastr:ToastrService, public router: Router) {}
  signupForm = signupForm;
  onSignup() {
    const email = this.signupForm.get('email')?.value;
    if (this.userService.users.some(emp => emp.email === email)) {
      this.toastr.error('Email already exists');
      return;
    }
    const formValue = this.signupForm.value;
    let s={
      id:0,
      name: formValue.name!,
      email: formValue.email!,
      password: formValue.password!,
      cart: []
    }
    this.userService.add(s);
    this.userService.currentUser.set(s);
    this.userService.loggedIn.set(true);
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('loggedInUser', JSON.stringify(s));
    this.router.navigate(['/products']);
  }
}
