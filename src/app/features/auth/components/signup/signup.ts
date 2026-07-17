import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { signupForm } from '../../../../shared/validators/authForms';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
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

    this.userService.add({
      id:0,
      name: formValue.name!,
      email: formValue.email!,
      password: formValue.password!,
    });
    this.userService.loggedIn.set(true);
    this.router.navigate(['/products']);
  }
}
