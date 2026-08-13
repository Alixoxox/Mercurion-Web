import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { contactForm } from '../../shared/validators/contactForms';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-12">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl">Contact Us</h1>
        <p class="mt-4 text-lg text-gray-600">
          Have a question or need help? We'd love to hear from you. Send us a message and we'll respond promptly.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="mail" class="block text-sm font-semibold text-gray-900">Mail</label>
            <div class="mt-2">
              <input id="mail" type="email" formControlName="mail" autocomplete="email"
                class="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                [class.border-red-500]="contactForm.get('mail')?.touched && contactForm.get('mail')?.invalid" />
            </div>
            <p class="text-xs text-red-500 mt-1" *ngIf="contactForm.get('mail')?.touched && contactForm.get('mail')?.invalid">A valid email is required</p>
          </div>

          <div>
            <label for="subject" class="block text-sm font-semibold text-gray-900">Subject</label>
            <div class="mt-2">
              <input id="subject" type="text" formControlName="subject"
                class="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                [class.border-red-500]="contactForm.get('subject')?.touched && contactForm.get('subject')?.invalid" />
            </div>
            <p class="text-xs text-red-500 mt-1" *ngIf="contactForm.get('subject')?.touched && contactForm.get('subject')?.invalid">Subject is required</p>
          </div>

          <div>
            <label for="message" class="block text-sm font-semibold text-gray-900">Message</label>
            <div class="mt-2">
              <textarea id="message" formControlName="message" rows="5"
                class="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                [class.border-red-500]="contactForm.get('message')?.touched && contactForm.get('message')?.invalid"></textarea>
            </div>
            <p class="text-xs text-red-500 mt-1" *ngIf="contactForm.get('message')?.touched && contactForm.get('message')?.invalid">Message must be at least 10 characters</p>
          </div>

          <div class="mt-8">
            <button type="submit"
              class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition cursor-pointer">
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class Contact {
  contactForm = contactForm;
  private toast = inject(ToastrService);
  private userService = inject(UserService);

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.toast.error('Please fill all required fields correctly', 'Validation Error', { timeOut: 2000, progressBar: true });
      return;
    }
    const payload = {
      mail: this.contactForm.get('mail')?.value ?? '',
      subject: this.contactForm.get('subject')?.value ?? '',
      message: this.contactForm.get('message')?.value ?? '',
    };
    this.userService.sendMail(payload).subscribe();
    setTimeout(() => {this.toast.success('Your message has been sent. We will get back to you soon.', 'Message Sent', { timeOut: 3000, progressBar: true })},500);
    this.contactForm.reset();
  }
}
