import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
})
export class AppComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  role = () => this.auth.currentRole();
  logout() { this.auth.logout(); }
  isAuthRoute() { return this.router.url.startsWith('/auth'); }
}