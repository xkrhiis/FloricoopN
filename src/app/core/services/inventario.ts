import { Injectable } from '@angular/core';

export type Producto = { id: number; nombre: string; stock: number; min?: number };

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private _data: Producto[] = [
    { id: 1, nombre: 'Rosa',   stock: 10, min: 2 },
    { id: 2, nombre: 'Clavel', stock: 25, min: 3 },
  ];
  private nextId = 3;

  all(): Producto[] {
    return this._data.map(p => ({ ...p }));
  }

  setStock(id: number, stock: number) {
    const p = this._data.find(x => x.id === id);
    if (p) p.stock = stock;
  }

  rename(id: number, nombre: string) {
    const p = this._data.find(x => x.id === id);
    if (p) p.nombre = nombre;
  }

  add(nombre: string, stock = 0, min = 0) {
    this._data.push({ id: this.nextId++, nombre, stock, min });
  }

  remove(id: number) {
    this._data = this._data.filter(p => p.id !== id);
  }
}
