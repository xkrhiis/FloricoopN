// src/app/features/inventario/pages/productos-lista/productos-lista.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ProductosService,
  Producto,
} from '../../../../core/services/productos.service';
import { AuthService } from '../../../../core/services/auth';
import { RegistrosService } from '../../../../core/services/registros.service';
import {
  UsuariosService,
  AppUser,
} from '../../../../core/services/usuarios.service';

// Modelo del formulario de alta
type NuevoProductoForm = {
  nombre: string;
  lote: string;
  color: string;
  precio: number | null;
  stock: number | null;
  min: number | null;
  fecha_ingreso: string;
  fecha_limite: string | null;
  activo: boolean;
  usuario_id: number | null;
};

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="container-fluid py-4">
      <!-- Título -->
      <div class="mb-4">
        <h1
          class="h3 font-weight-bold mb-1"
          style="color: var(--fc-primary-600)"
        >
          Inventario de productos
        </h1>
        <p class="text-muted mb-0">
          Listado en tiempo real desde la API <code>/api/productos</code>.
        </p>
      </div>

      <!-- Resumen -->
      <div class="row mb-4" *ngIf="productos.length">
        <div class="col-md-4 mb-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Total de productos</div>
              <div class="h3 mb-0">{{ productos.length }}</div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Stock total (unidades)</div>
              <div class="h3 mb-0">{{ totalStock }}</div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Ítems bajo mínimo</div>
              <div
                class="h3 mb-0"
                [ngClass]="bajoMinimo > 0 ? 'text-danger' : 'text-success'"
              >
                {{ bajoMinimo }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjeta principal -->
      <div class="card shadow-sm border-0">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <div>
            <h5 class="mb-0">Inventario general</h5>
            <small class="text-muted">
              Detalle de productos registrados en la cooperativa.
            </small>
          </div>

          <!-- Botón solo ADMIN -->
          <button
            *ngIf="isAdmin"
            type="button"
            class="btn btn-sm"
            [ngClass]="nuevoVisible ? 'btn-outline-secondary' : 'btn-primary'"
            (click)="toggleNuevo()"
          >
            <ng-container *ngIf="!nuevoVisible">
              + Registrar producto
            </ng-container>
            <ng-container *ngIf="nuevoVisible">
              Cancelar
            </ng-container>
          </button>
        </div>

        <!-- Aviso de campos obligatorios -->
        <div *ngIf="mostrarErrorCampos" class="alert alert-warning mb-0">
          Faltan campos obligatorios por rellenar. Revisa los marcados con
          <span class="text-danger">*</span>.
        </div>

        <!-- Formulario nuevo producto (solo admin) -->
        <div class="card-body border-bottom" *ngIf="nuevoVisible && isAdmin">
          <form (ngSubmit)="guardarNuevo()" #f="ngForm" class="row g-3">
            <div class="col-md-3 mb-3">
              <label class="form-label small text-muted">
                Nombre <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="nuevo.nombre"
                name="nombre"
                required
              />
            </div>

            <div class="col-md-2 mb-3">
              <label class="form-label small text-muted">
                Lote <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="nuevo.lote"
                name="lote"
                required
              />
            </div>

            <div class="col-md-2 mb-3">
              <label class="form-label small text-muted">
                Color <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="nuevo.color"
                name="color"
                required
              />
            </div>

            <div class="col-md-2 mb-3">
              <label class="form-label small text-muted">
                Precio (CLP) <span class="text-danger">*</span>
              </label>
              <input
                type="number"
                class="form-control"
                [(ngModel)]="nuevo.precio"
                name="precio"
                min="1"
                required
              />
            </div>

            <div class="col-md-1 mb-3">
              <label class="form-label small text-muted">
                Stock <span class="text-danger">*</span>
              </label>
              <input
                type="number"
                class="form-control"
                [(ngModel)]="nuevo.stock"
                name="stock"
                min="1"
                required
              />
            </div>

            <div class="col-md-2 mb-3">
              <label class="form-label small text-muted">
                Mínimo <span class="text-danger">*</span>
              </label>
              <input
                type="number"
                class="form-control"
                [(ngModel)]="nuevo.min"
                name="min"
                min="0"
                required
              />
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label small text-muted">
                Fecha ingreso <span class="text-danger">*</span>
              </label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="nuevo.fecha_ingreso"
                name="fecha_ingreso"
                required
              />
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label small text-muted">
                Fecha límite <span class="text-danger">*</span>
              </label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="nuevo.fecha_limite"
                name="fecha_limite"
                required
              />
            </div>

            <!-- Usuario que recepciona -->
            <div class="col-md-3 mb-3">
              <label class="form-label small text-muted">
                Recepcionado por <span class="text-danger">*</span>
              </label>
              <select
                class="form-control"
                [(ngModel)]="nuevo.usuario_id"
                name="usuario_id"
                required
              >
                <option [ngValue]="null" disabled>Seleccione un usuario</option>
                <option *ngFor="let u of usuarios" [ngValue]="u.id">
                  {{ u.username }}
                </option>
              </select>
            </div>

            <div class="col-md-2 mb-3 d-flex align-items-end">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="nuevo-activo"
                  [(ngModel)]="nuevo.activo"
                  name="activo"
                />
                <label class="form-check-label small" for="nuevo-activo">
                  Activo
                </label>
              </div>
            </div>

            <div class="col-12 d-flex justify-content-end">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="guardando"
              >
                <span
                  *ngIf="guardando"
                  class="spinner-border spinner-border-sm mr-1"
                ></span>
                Guardar producto
              </button>
            </div>
          </form>
        </div>

        <!-- Cuerpo de la tabla -->
        <div class="card-body p-0">
          <!-- Cargando -->
          <div *ngIf="cargando" class="p-3 text-center text-muted">
            <span class="mr-2">
              <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            Cargando inventario...
          </div>

          <!-- Error -->
          <div *ngIf="error" class="alert alert-danger m-3 mb-0">
            {{ error }}
          </div>

          <!-- Tabla -->
          <div class="table-responsive" *ngIf="!cargando && productos.length">
            <table
              class="table table-hover table-inventario mb-0 align-middle"
            >
              <thead class="thead-light">
                <tr>
                  <th>Producto</th>
                  <th>Color</th>
                  <th>Lote</th>
                  <th style="width: 140px;">Fecha ingreso</th>
                  <th style="width: 140px;">Fecha límite</th>
                  <th class="text-center" style="width: 90px;">Stock</th>
                  <th class="text-right" style="width: 130px;">
                    Precio unitario
                  </th>
                  <th class="text-right" style="width: 150px;">
                    Valor total
                  </th>
                  <th
                    *ngIf="isAdmin"
                    class="text-right"
                    style="width: 170px;"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let p of productos"
                  [ngClass]="{
                    'row-bajo-minimo': (p.stock ?? 0) < (p.min ?? 0)
                  }"
                >
                  <td>{{ p.nombre }}</td>
                  <td>{{ p.color || '—' }}</td>
                  <td>{{ p.lote || '—' }}</td>
                  <td>
                    {{
                      p.fecha_ingreso
                        ? (p.fecha_ingreso | date: 'dd/MM/yyyy')
                        : '—'
                    }}
                  </td>
                  <td>
                    {{
                      p.fecha_limite
                        ? (p.fecha_limite | date: 'dd/MM/yyyy')
                        : '—'
                    }}
                  </td>
                  <td class="text-center">
                    {{ p.stock ?? 0 }}
                  </td>
                  <td class="text-right">
                    {{
                      p.precio | currency : 'CLP' : 'symbol-narrow' : '1.0-0'
                    }}
                  </td>
                  <td class="text-right">
                    {{
                      (p.precio * (p.stock ?? 0))
                        | currency : 'CLP' : 'symbol-narrow' : '1.0-0'
                    }}
                  </td>

                  <!-- Acciones solo ADMIN -->
                  <td class="text-right" *ngIf="isAdmin">
                    <div class="table-actions d-inline-flex">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary"
                        (click)="editarProducto(p)"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        (click)="eliminarProducto(p)"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Sin datos -->
          <div
            *ngIf="!cargando && !productos.length && !error"
            class="p-4 text-center text-muted"
          >
            No hay productos registrados todavía.
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductosListaComponent implements OnInit {
  productos: Producto[] = [];
  usuarios: AppUser[] = [];

  cargando = false;
  guardando = false;
  error: string | null = null;
  mostrarErrorCampos = false;

  nuevoVisible = false;
  nuevo: NuevoProductoForm = this.crearModeloNuevo();

  constructor(
    private productosService: ProductosService,
    private auth: AuthService,
    private registrosService: RegistrosService,
    private usuariosService: UsuariosService
  ) {}

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    this.cargarProductos();
    if (this.isAdmin) {
      this.cargarUsuarios();
    }
  }

  private crearModeloNuevo(): NuevoProductoForm {
    return {
      nombre: '',
      lote: '',
      color: '',
      precio: null,
      stock: null,
      min: null,
      fecha_ingreso: '',
      fecha_limite: null,
      activo: true,
      usuario_id: null,
    };
  }

  get totalStock(): number {
    return this.productos.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  }

  get bajoMinimo(): number {
    return this.productos.filter(
      (p) => (p.stock ?? 0) < (p.min ?? 0)
    ).length;
  }

  toggleNuevo(): void {
    if (!this.isAdmin) return;

    this.nuevoVisible = !this.nuevoVisible;
    this.mostrarErrorCampos = false;
    this.error = null;

    if (this.nuevoVisible) {
      this.nuevo = this.crearModeloNuevo();
    }
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = null;

    this.productosService.list().subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar productos', err);
        this.error = 'No se pudo cargar el inventario.';
        this.cargando = false;
      },
    });
  }

  cargarUsuarios(): void {
    this.usuariosService.list().subscribe({
      next: (data: AppUser[]) => (this.usuarios = data),
      error: (err: any) =>
        console.error('Error al cargar usuarios para el formulario', err),
    });
  }

  guardarNuevo(): void {
    if (!this.isAdmin) return;

    const n = this.nuevo;

    if (
      !n.nombre ||
      !n.lote ||
      !n.color ||
      !n.fecha_ingreso ||
      !n.fecha_limite ||
      !n.usuario_id ||
      n.precio === null ||
      n.precio <= 0 ||
      n.stock === null ||
      n.stock <= 0 ||
      n.min === null ||
      n.min < 0
    ) {
      this.mostrarErrorCampos = true;
      this.error = 'Faltan campos obligatorios por rellenar.';
      return;
    }

    this.mostrarErrorCampos = false;
    this.error = null;
    this.guardando = true;

    this.productosService
      .create({
        nombre: n.nombre,
        lote: n.lote,
        color: n.color,
        precio: n.precio,
        stock: n.stock,
        min: n.min,
        fecha_ingreso: n.fecha_ingreso,
        fecha_limite: n.fecha_limite,
        activo: n.activo,
      })
      .subscribe({
        next: (resp: any) => {
          const productoId: number = resp?.id ?? 0;
          const cantidad = n.stock ?? 0;

          if (productoId > 0) {
            this.registrosService
              .create({
                lote: n.lote,
                producto_id: productoId,
                precio_unitario: n.precio!,
                cantidad,
                usuario_id: n.usuario_id!,
                fecha_registro: n.fecha_ingreso,
              })
              .subscribe({
                error: (err: any) =>
                  console.error(
                    'No se pudo registrar el movimiento en el historial',
                    err
                  ),
              });
          }

          this.guardando = false;
          this.nuevoVisible = false;
          this.nuevo = this.crearModeloNuevo();
          this.cargarProductos();
        },
        error: (err: any) => {
          console.error('Error al crear producto', err);
          this.error = 'No se pudo crear el producto.';
          this.guardando = false;
        },
      });
  }

  editarProducto(_p: Producto): void {
    alert('Función de edición pendiente de implementar 😊');
  }

  eliminarProducto(p: Producto): void {
    if (!this.isAdmin || !p.id) return;

    const seguro = confirm(
      `¿Seguro que quieres eliminar el producto "${p.nombre}" (#${p.id})?`
    );
    if (!seguro) return;

    this.error = null;

    this.productosService.remove(p.id).subscribe({
      next: () => {
        this.productos = this.productos.filter((prod) => prod.id !== p.id);
      },
      error: (err: any) => {
        console.error('Error al eliminar producto', err);
        this.error = 'No se pudo eliminar el producto.';
      },
    });
  }
}
