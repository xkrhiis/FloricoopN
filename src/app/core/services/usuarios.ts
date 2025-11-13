import { Injectable } from '@angular/core';

export interface Usuario { id: number; nombre: string; role: 'admin' | 'user'; }

@Injectable({ providedIn: 'root' })
export class Usuarios {
  private data: Usuario[] = [
    { id: 1, nombre: 'Ana',  role: 'admin' },
    { id: 2, nombre: 'Luis', role: 'user' },
  ];

  all(): Usuario[] { return [...this.data]; }
}