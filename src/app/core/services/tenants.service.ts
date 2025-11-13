import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Tenant {
  id?: number;
  nombre: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class TenantsService {
  // Si tu API expone /tenants (sin /api), cambia a: private base = '/tenants';
  private base = '/api/tenants';

  constructor(private http: HttpClient) {}

  list() { return this.http.get<Tenant[]>(this.base); }
  get(id: number) { return this.http.get<Tenant>(`${this.base}/${id}`); }
  create(data: Tenant) { return this.http.post<{ok:boolean; id:number}>(this.base, data); }
  update(id: number, data: Partial<Tenant>) { return this.http.put(`${this.base}/${id}`, data); }
  remove(id: number) { return this.http.delete<{ok:boolean; deleted:boolean}>(`${this.base}/${id}`); }
}
