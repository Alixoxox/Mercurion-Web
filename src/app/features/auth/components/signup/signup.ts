import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { signupForm } from '../../../../shared/validators/authForms';
import { UserService } from '../../../../core/services/user.service';
import { user } from '../../../../shared/models/userDTO.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signup.html',
})
export class Signup {
  constructor(private userService: UserService, public toastr: ToastrService, public router: Router) {}
  signupForm = signupForm;
  isLoading = false;

  onSignup() {
    const formValue = this.signupForm.value;
    this.isLoading = true;
    this.userService.register(formValue.name!, formValue.email!, formValue.password!).subscribe({
      next: (res) => {
        const s: user = {
          id: res.UserData.id,
          name: res.UserData.name,
          email: res.UserData.email,
          password: '',
          cart: []
        };
        this.isLoading = false;
        this.userService.setAuthenticated(s, res.Token);
        this.toastr.success('Account created');
        this.router.navigate(['/products']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const serverMessage = typeof err.error === 'string' ? err.error : err.error?.message;
        this.toastr.error(serverMessage || 'Registration failed. Please try again.');
      }
    });
  }
}
