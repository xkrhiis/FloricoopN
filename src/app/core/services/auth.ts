import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private role = signal<string | null>(null);

  constructor(private router: Router) {}

  currentRole() { return this.role(); }

  login(username: string, password: string) {
    // Demo simple
    if (username === 'admin' && password === 'admin') {
      this.role.set('admin');
      this.router.navigateByUrl('/dashboard');
      return true;
    }
    if (username === 'user' && password === 'user') {
      this.role.set('user');
      this.router.navigateByUrl('/dashboard');
      return true;
    }
    return false;
  }

  logout() {
    this.role.set(null);
    this.router.navigateByUrl('/auth/login');
  }

  isLoggedIn() { return !!this.role(); }
}