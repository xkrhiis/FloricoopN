import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  stock?: number;
  activo?: boolean;
  creado_en?: string;
  min?: number; // necesario para el template (p.min ?? 0)
}

// Tipos para aceptar respuestas directas o “envueltas”
type ListApiResp =
  | Producto[]
  | { ok: boolean; data: Producto[]; total?: number };

type ItemApiResp =
  | Producto
  | { ok: boolean; data: Producto };

@Injectable({ providedIn: 'root' })
export class ProductosService {
  // Gracias al proxy: /api -> http://localhost:3000
  private base = '/api/productos';

  constructor(private http: HttpClient) {}

  /** Devuelve siempre Producto[] aunque el backend envíe {ok,data} */
  list(): Observable<Producto[]> {
    return this.http.get<ListApiResp>(this.base).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.data ?? [])))
    );
  }

  /** Devuelve siempre Producto aunque el backend envíe {ok,data} */
  get(id: number): Observable<Producto> {
    return this.http.get<ItemApiResp>(`${this.base}/${id}`).pipe(
      map((res) => (res as any)?.data ?? (res as Producto))
    );
  }

  /** Crea un producto (con valores por defecto si faltan) */
  create(data: Partial<Producto>) {
    const body: Partial<Producto> = {
      nombre: data.nombre!,               // requerido
      precio: data.precio ?? 0,
      stock:  data.stock  ?? 0,
      activo: data.activo ?? true,
      min:    data.min    ?? 0
    };
    return this.http.post<{ id: number }>(this.base, body);
  }

  /** Actualiza campos parciales (PATCH) */
  update(id: number, data: Partial<Producto>) {
    return this.http.patch(`${this.base}/${id}`, data);
  }

  /** Elimina por id */
  remove(id: number) {
    return this.http.delete<{ deleted?: boolean }>(`${this.base}/${id}`);
  }
}
