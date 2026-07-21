import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-footer',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './footer.html'})
export class Footer {
  constructor(private toastr: ToastrService) {}

  newsForm = new FormGroup({
    email: new FormControl('', [Validators.email]),
  });

  onSubmit(): void {
    if (this.newsForm.invalid) return;
    this.toastr.info(`Thank You!\nYou have been Subscribed to our Newsletter.` );
    this.newsForm.reset();
  }
}
