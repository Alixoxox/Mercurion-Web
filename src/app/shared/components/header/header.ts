import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink,CommonModule],
  standalone: true,
  templateUrl: './header.html',
})
export class Header {
  constructor(public userService:UserService){}
  cartCount=this.userService.cartCount;

}
