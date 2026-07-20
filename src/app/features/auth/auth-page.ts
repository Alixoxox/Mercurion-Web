import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-page',
  imports: [RouterOutlet],
  standalone: true,
  templateUrl: './auth-page.html',
  host: { class: 'flex flex-1' },
})
export class AuthPage {}
