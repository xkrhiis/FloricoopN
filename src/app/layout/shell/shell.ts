import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './shell.html',
  styleUrls: ['./shell.scss'],
})
export class ShellComponent {
  readonly currentYear = new Date().getFullYear();

  constructor(public auth: AuthService) {}

  isAuthRoute(): boolean {
    return location.pathname.startsWith('/auth/');
  }

  logout(): void {
    this.auth.logout();
  }
}