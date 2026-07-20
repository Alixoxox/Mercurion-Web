import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone:true,
  template: `
    <div class="max-w-5xl mx-auto px-4 py-12">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl">About Meezan</h1>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Your trusted destination for quality products at unbeatable prices. We curate a diverse collection
          across categories from fashion and electronics to home essentials, ensuring every purchase
          delivers value, authenticity, and delight.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
          <p class="text-gray-600 leading-relaxed">
            To make quality shopping accessible to everyone by offering a seamless online experience,
            honest pricing, and products we stand behind. We believe every purchase should feel like
            a smart choice.
          </p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">Why Shop With Us</h2>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-center gap-2"><span class="text-blue-600 font-bold">&check;</span> Free shipping on all orders</li>
            <li class="flex items-center gap-2"><span class="text-blue-600 font-bold">&check;</span> Easy 30 day returns</li>
            <li class="flex items-center gap-2"><span class="text-blue-600 font-bold">&check;</span> 24/7 customer support</li>
            <li class="flex items-center gap-2"><span class="text-blue-600 font-bold">&check;</span> Secure payment gateway</li>
          </ul>
        </div>
      </div>

      <dl class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <dt class="text-sm text-gray-500 mb-1">Products available</dt>
          <dd class="text-3xl font-bold text-gray-900">20+</dd>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <dt class="text-sm text-gray-500 mb-1">Happy customers</dt>
          <dd class="text-3xl font-bold text-gray-900">5,000+</dd>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <dt class="text-sm text-gray-500 mb-1">Categories</dt>
          <dd class="text-3xl font-bold text-gray-900">All</dd>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <dt class="text-sm text-gray-500 mb-1">Delivery time</dt>
          <dd class="text-3xl font-bold text-gray-900">3 to 5 Days</dd>
        </div>
      </dl>
    </div>
  `,
})
export class About {}
