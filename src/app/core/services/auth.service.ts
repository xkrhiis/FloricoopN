import { Injectable } from '@angular/core';

type Role = 'admin' | 'user';
type User = { username: string; role: Role } | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user: User = JSON.parse(localStorage.getItem('user') || 'null');

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin') {
      this._user = { username, role: 'admin' };
    } else if (username === 'user' && password === 'user') {
      this._user = { username, role: 'user' };
    } else {
      return false;
    }
    localStorage.setItem('user', JSON.stringify(this._user));
    return true;
  }

  logout() {
    localStorage.removeItem('role');
  }

  isLoggedIn(): boolean {
    return !!this._user;
  }

  currentRole(): Role | '' {
    return this._user?.role ?? '';
  }
}
