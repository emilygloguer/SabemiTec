import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LadybugIconComponent } from '../ladybug-icon/ladybug-icon.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, LadybugIconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {}
