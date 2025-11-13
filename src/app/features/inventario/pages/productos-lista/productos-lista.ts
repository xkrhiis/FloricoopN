import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Servicio API + tipos
import { ProductosService, Producto } from '../../../../core/services/productos.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIf, NgFor],
  templateUrl: './productos-lista.html',
  styleUrls: ['./productos-lista.scss'],
})
export class ProductosListaComponent implements OnInit {
  // Servicios (API + Auth)
  private productosSvc = inject(ProductosService);
  private auth = inject(AuthService);

  // Estado UI
  productos = signal<Producto[]>([]);
  cargando  = signal<boolean>(false);
  errorMsg  = signal<string>('');

  // Edición
  editingId = signal<number | null>(null);
  draftName = signal<string>('');

  // Rol
  isAdmin = computed(() => this.auth.currentRole() === 'admin');

  ngOnInit(): void {
    this.cargar();
  }

  // ==== Helpers =====
  private setError(msg: string) {
    this.errorMsg.set(msg);
    this.cargando.set(false);
  }

  private refreshList() {
    this.cargar();
  }

  // ==== Lectura =====
  cargar() {
    this.cargando.set(true);
    this.errorMsg.set('');
    this.productosSvc.list().subscribe({
      next: (rows) => this.productos.set(rows ?? []),
      error: (err) => {
        console.error(err);
        this.setError(err?.error?.error || 'Error al cargar productos');
      },
      complete: () => this.cargando.set(false),
    });
  }

  // ==== UI (filtros/estilos) =====
  // ⚠️ Corrección de precedencia: el ?? tiene menor prioridad que <=
  // antes:  (p.stock ?? 0) <= (p as any).min ?? 0    (mal)
  // ahora:  (p.stock ?? 0) <= ((p as any).min ?? 0)  (bien)
  isLow = (p: Producto) => (p.stock ?? 0) <= ((p as any).min ?? 0);

  // ==== Acciones =====
  setStock(p: Producto, value: number | string | null) {
    if (!this.isAdmin()) return;
    const num = Number(value);
    const v = Number.isFinite(num) ? Math.max(0, Math.floor(num)) : (p.stock ?? 0);

    this.cargando.set(true);
    this.productosSvc.update(p.id!, { stock: v }).subscribe({
      next: () => this.refreshList(),
      error: (err) => this.setError(err?.error?.error || 'No se pudo actualizar stock'),
    });
  }

  startRename(p: Producto) {
    if (!this.isAdmin()) return;
    this.editingId.set(p.id!);
    this.draftName.set(p.nombre);
  }

  saveRename(p: Producto) {
    if (!this.isAdmin()) return;
    const name = (this.draftName() || '').trim();
    if (!name) return;

    this.cargando.set(true);
    this.productosSvc.update(p.id!, { nombre: name }).subscribe({
      next: () => {
        this.editingId.set(null);
        this.refreshList();
      },
      error: (err) => this.setError(err?.error?.error || 'No se pudo renombrar'),
    });
  }

  cancelRename() {
    this.editingId.set(null);
  }

  add() {
    if (!this.isAdmin()) return;
    const nombre = (prompt('Nombre del producto:', 'Nuevo') || '').trim();
    if (!nombre) return;

    this.cargando.set(true);
    this.productosSvc.create({ nombre, precio: 0, stock: 0, activo: true }).subscribe({
      next: () => this.refreshList(),
      error: (err) => this.setError(err?.error?.error || 'No se pudo crear el producto'),
    });
  }

  remove(p: Producto) {
    if (!this.isAdmin()) return;
    if (!confirm(`Eliminar "${p.nombre}"?`)) return;

    this.cargando.set(true);
    this.productosSvc.remove(p.id!).subscribe({
      next: () => this.refreshList(),
      error: (err) => this.setError(err?.error?.error || 'No se pudo eliminar'),
    });
  }

  // trackBy para *ngFor
  trackById = (_: number, item: Producto) => item.id;
}
