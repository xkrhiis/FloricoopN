// src/app/core/services/mermas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

export interface Merma {
  id?: number;
  producto_id: number;
  producto_nombre?: string;
  lote?: string | null;
  cantidad: number;
  motivo: string;
  detalle?: string | null;
  fecha_merma: string; // 'YYYY-MM-DD' o datetime
  registrado_por: number;
  registrado_por_nombre?: string;
  creado_en?: string;
}

@Injectable({ providedIn: 'root' })
export class MermasService {
  private base = '/api/mermas';

  // 🔔 señal para que el dashboard se refresque
  private changedSubject = new Subject<void>();
  changed$ = this.changedSubject.asObservable();

  constructor(private http: HttpClient) {}

  private notifyChanged(): void {
    this.changedSubject.next();
  }

  list(): Observable<Merma[]> {
    return this.http.get<Merma[]>(this.base);
  }

  get(id: number): Observable<Merma> {
    return this.http.get<Merma>(`${this.base}/${id}`);
  }

  create(data: Merma | Omit<Merma, 'id'>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.base, data).pipe(
      tap(() => this.notifyChanged())
    );
  }

  remove(id: number): Observable<{ deleted?: boolean }> {
    return this.http.delete<{ deleted?: boolean }>(`${this.base}/${id}`).pipe(
      tap(() => this.notifyChanged())
    );
  }
}
