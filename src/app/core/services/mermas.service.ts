// src/app/core/services/mermas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Merma {
  id?: number;
  producto_id: number;
  producto_nombre?: string;
  lote?: string | null;
  cantidad: number;
  motivo: string;
  detalle?: string | null;
  fecha_merma: string; // 'YYYY-MM-DD'
  registrado_por: number;
  registrado_por_nombre?: string;
  creado_en?: string;
}

@Injectable({ providedIn: 'root' })
export class MermasService {
  // Usamos el mismo proxy: /api -> http://localhost:3000
  private base = '/api/mermas';

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Merma[]>(this.base);
  }

  get(id: number) {
    return this.http.get<Merma>(`${this.base}/${id}`);
  }

  create(data: Merma | Omit<Merma, 'id'>) {
    return this.http.post<{ id: number }>(this.base, data);
  }

  remove(id: number) {
    return this.http.delete<{ deleted?: boolean }>(`${this.base}/${id}`);
  }
}
