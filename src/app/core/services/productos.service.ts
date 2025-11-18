// src/app/core/services/productos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id?: number;

  // Datos principales
  nombre: string;
  lote?: string;
  color?: string;

  // Precios y stock
  precio: number;
  stock?: number;
  min?: number;                 // stock mínimo
  precio_total?: number;        // puede venir calculado desde la API

  // Fechas
  fecha_ingreso?: string;       // string ISO (ej: '2025-11-16')
  fecha_limite?: string | null; // puede ser null

  // Estado
  activo?: boolean | number;    // boolean en front, TINYINT(1) en BD

  // Info de creación
  creado_en?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  // Gracias al proxy, esto apunta a http://localhost:3000/api/productos
  private readonly baseUrl = '/api/productos';

  constructor(private http: HttpClient) {}

  /** Lista completa de productos activos */
  list(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  /** Obtiene un producto por id */
  get(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  /** Crea un producto nuevo */
  create(data: Partial<Producto>): Observable<{ id: number }> {
    const body: Partial<Producto> = {
      nombre: data.nombre!,           // requerido
      lote: data.lote,
      color: data.color,
      precio: data.precio ?? 0,
      stock: data.stock ?? 0,
      min: data.min ?? 0,
      fecha_ingreso: data.fecha_ingreso,
      fecha_limite: data.fecha_limite ?? null,
      activo: data.activo ?? true,
    };

    return this.http.post<{ id: number }>(this.baseUrl, body);
  }

  /** Actualiza campos parciales (PATCH) */
  update(id: number, data: Partial<Producto>): Observable<Producto> {
    return this.http.patch<Producto>(`${this.baseUrl}/${id}`, data);
  }

  /** Elimina (soft-delete) un producto por id */
  remove(id: number): Observable<{ deleted?: boolean }> {
    return this.http.delete<{ deleted?: boolean }>(`${this.baseUrl}/${id}`);
  }
}
