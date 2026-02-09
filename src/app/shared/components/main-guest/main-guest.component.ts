import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-guest',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-guest.component.html',
  styleUrl: './main-guest.component.css'
})
export class MainGuestComponent {}
