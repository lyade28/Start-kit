import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-accueil-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './accueil-page.component.html',
  styleUrls: ['./accueil-page.component.css']
})
export class AccueilPageComponent { }
