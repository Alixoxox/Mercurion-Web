import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone:true,
  template: `
    <div class="max-w-3xl mx-auto px-4 py-12">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl">Contact Us</h1>
        <p class="mt-4 text-lg text-gray-600">
          Have a question or need help? We'd love to hear from you. Send us a message and we'll respond promptly.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form action="#" method="POST">
          <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <div>
              <label for="first-name" class="block text-sm font-semibold text-gray-900">First name</label>
              <div class="mt-2">
                <input id="first-name" type="text" name="first-name" autocomplete="given-name"
                  class="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label for="last-name" class="block text-sm font-semibold text-gray-900">Last name</label>
              <div class="mt-2">
                <input id="last-name" type="text" name="last-name" autocomplete="family-name"
                  class="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
              </div>
            </div>
            <div class="sm:col-span-2">
              <label for="email" class="block text-sm font-semibold text-gray-900">Email</label>
              <div class="mt-2">
                <input id="email" type="email" name="email" autocomplete="email"
                  class="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
              </div>
            </div>
            <div class="sm:col-span-2">
              <label for="message" class="block text-sm font-semibold text-gray-900">Message</label>
              <div class="mt-2">
                <textarea id="message" name="message" rows="5"
                  class="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"></textarea>
              </div>
            </div>
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
  onSubmit() {

  }
}
