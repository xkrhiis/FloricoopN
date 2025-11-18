// src/app/core/services/auth.ts
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // guardamos solo el rol: 'admin' | 'user' | null
  private role = signal<string | null>(null);

  constructor(private router: Router) {}

  // Devuelve el rol actual
  currentRole(): string | null {
    return this.role();
  }

  // ¿hay alguien logueado?
  isLoggedIn(): boolean {
    return !!this.role();
  }

  // 👇 NUEVO: helper para saber si es admin
  isAdmin(): boolean {
    return this.currentRole() === 'admin';
  }

  // Login de demo (admin/admin, user/user)
  login(username: string, password: string): boolean {
    // Admin
    if (username === 'admin' && password === 'admin') {
      this.role.set('admin');
      this.router.navigateByUrl('/dashboard');
      return true;
    }

    // Usuario estándar
    if (username === 'user' && password === 'user') {
      this.role.set('user');
      this.router.navigateByUrl('/dashboard');
      return true;
    }

    // Credenciales incorrectas
    return false;
  }

  // Cerrar sesión
  logout(): void {
    this.role.set(null);
    this.router.navigateByUrl('/auth/login');
  }
}
