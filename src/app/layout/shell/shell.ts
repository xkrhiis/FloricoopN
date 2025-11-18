// src/app/layout/shell/shell.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrls: ['./shell.scss'],
})
export class ShellComponent {
  readonly currentYear = new Date().getFullYear();

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  isAuthRoute(): boolean {
    return this.router.url.startsWith('/auth/');
  }

  logout(): void {
    this.auth.logout();
  }
}
