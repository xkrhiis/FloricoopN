// src/app/core/services/usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Role = 'admin' | 'user';

export interface AppUser {
  id?: number;
  username: string;
  password?: string;
  role: Role;
  created_at?: string; // alias de "creado_en" en la API
}

// Alias opcional
export type Usuario = AppUser;

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly base = '/api/usuarios';

  constructor(private http: HttpClient) {}

  list(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.base);
  }

  get(id: number): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.base}/${id}`);
  }

  create(data: Partial<AppUser>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.base, data);
  }

  update(id: number, data: Partial<AppUser>): Observable<{ updated: boolean }> {
    return this.http.patch<{ updated: boolean }>(`${this.base}/${id}`, data);
  }

  remove(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/${id}`);
  }
}
