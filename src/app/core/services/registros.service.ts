// src/app/core/services/registros.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroInventario {
  id: number;
  fecha_registro: string;
  lote: string;

  producto_id: number;
  producto: string;

  precio_unitario: number;
  cantidad: number;

  color: string | null;
  fecha_ingreso: string | null;
  fecha_limite: string | null;

  usuario_id: number;
  usuario: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrosService {
  private readonly base = '/api/registros';

  constructor(private http: HttpClient) {}

  list(): Observable<RegistroInventario[]> {
    return this.http.get<RegistroInventario[]>(this.base);
  }

  // Coincide EXACTAMENTE con lo que usa tu Node (registros.service.js)
  create(data: {
    lote: string;
    producto_id: number;
    precio_unitario: number;
    cantidad: number;
    usuario_id: number;
    fecha_registro?: string;
  }) {
    return this.http.post<{ id: number }>(this.base, data);
  }
}
