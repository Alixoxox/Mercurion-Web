import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  template: `
    <div class="max-w-3xl mx-auto px-4 py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
      <p class="text-gray-600 leading-relaxed">Have a question or feedback? Reach out to us at <a href="mailto:support@meezan.com" class="text-blue-600 hover:underline">support&#64;meezan.com</a> and we'll get back to you as soon as possible.</p>
    </div>
  `,
})
export class Contact {}
