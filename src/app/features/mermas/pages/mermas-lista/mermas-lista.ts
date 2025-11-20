// src/app/features/mermas/pages/mermas-lista/mermas-lista.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MermasService,
  Merma,
} from '../../../../core/services/mermas.service';

import {
  ProductosService,
  Producto,
} from '../../../../core/services/productos.service';

import {
  UsuariosService,
  AppUser,
} from '../../../../core/services/usuarios.service';

import { AuthService } from '../../../../core/services/auth';

type NuevaMermaForm = {
  producto_id: number | null;
  lote: string;
  cantidad: number | null;
  motivo: string;
  detalle: string;
  fecha_merma: string;
  registrado_por: number | null;
};

@Component({
  selector: 'app-mermas-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="container-fluid py-4">
      <!-- Título -->
      <div class="mb-4">
        <h1 class="h3 font-weight-bold mb-1" style="color: var(--fc-primary-600)">
          Mermas de inventario
        </h1>
        <p class="text-muted mb-0">
          Registro de pérdidas, productos dañados o vencidos.
        </p>
      </div>

      <div class="card shadow-sm border-0">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <div>
            <h5 class="mb-0">Mermas registradas</h5>
            <small class="text-muted">
              Control de productos que salieron del inventario por merma.
            </small>
          </div>

          <button
            *ngIf="isAdmin"
            type="button"
            class="btn btn-sm"
            [ngClass]="nuevoVisible ? 'btn-outline-secondary' : 'btn-danger'"
            (click)="toggleNuevo()"
          >
            <ng-container *ngIf="!nuevoVisible">
              + Registrar merma
            </ng-container>
            <ng-container *ngIf="nuevoVisible">
              Cancelar
            </ng-container>
          </button>
        </div>

        <!-- Avisos -->
        <div *ngIf="mostrarErrorCampos" class="alert alert-warning mb-0">
          Faltan datos obligatorios por completar.
        </div>

        <div *ngIf="error" class="alert alert-danger mb-0">
          {{ error }}
        </div>

        <!-- Formulario nueva merma -->
        <div class="card-body border-bottom" *ngIf="nuevoVisible && isAdmin">
          <form (ngSubmit)="guardarNuevaMerma()" class="row g-3">
            <div class="col-md-4 mb-3">
              <label class="form-label small text-muted">
                Producto <span class="text-danger">*</span>
              </label>
              <select
                class="form-control"
                [(ngModel)]="nuevo.producto_id"
                name="producto_id"
                required
              >
                <option [ngValue]="null" disabled>Seleccione un producto</option>
                <option *ngFor="let p of productos" [ngValue]="p.id">
                  {{ p.nombre }}
                </option>
              </select>
            </div>

            <div class="col-md-2 mb-3">
              <label class="form-label small text-muted">
                Lote
              </label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="nuevo.lote"
                name="lote"
              />
            </div>

            <div class="col-md-2 mb-3">
              <label class="form-label small text-muted">
                Cantidad <span class="text-danger">*</span>
              </label>
              <input
                type="number"
                class="form-control"
                [(ngModel)]="nuevo.cantidad"
                name="cantidad"
                min="1"
                required
              />
            </div>

            <div class="col-md-2 mb-3">
              <label class="form-label small text-muted">
                Fecha merma <span class="text-danger">*</span>
              </label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="nuevo.fecha_merma"
                name="fecha_merma"
                required
              />
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label small text-muted">
                Motivo <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="nuevo.motivo"
                name="motivo"
                placeholder="Producto vencido, daño en bodegas, etc."
                required
              />
            </div>

            <div class="col-md-5 mb-3">
              <label class="form-label small text-muted">
                Detalle
              </label>
              <textarea
                class="form-control"
                rows="2"
                [(ngModel)]="nuevo.detalle"
                name="detalle"
                placeholder="Descripción más detallada de la merma (opcional)"
              ></textarea>
            </div>

            <div class="col-md-3 mb-3">
              <label class="form-label small text-muted">
                Registrado por <span class="text-danger">*</span>
              </label>
              <select
                class="form-control"
                [(ngModel)]="nuevo.registrado_por"
                name="registrado_por"
                required
              >
                <option [ngValue]="null" disabled>Seleccione un usuario</option>
                <option *ngFor="let u of usuarios" [ngValue]="u.id">
                  {{ u.username }}
                </option>
              </select>
            </div>

            <div class="col-12 d-flex justify-content-end">
              <button
                type="submit"
                class="btn btn-danger"
                [disabled]="guardando"
              >
                <span
                  *ngIf="guardando"
                  class="spinner-border spinner-border-sm mr-1"
                ></span>
                Guardar merma
              </button>
            </div>
          </form>
        </div>

        <!-- Tabla -->
        <div class="card-body p-0">
          <div *ngIf="cargando" class="p-3 text-center text-muted">
            <span class="mr-2">
              <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            Cargando mermas...
          </div>

          <div class="table-responsive" *ngIf="!cargando && mermas.length">
            <table class="table table-hover mb-0 align-middle">
              <thead class="thead-light">
                <tr>
                  <th>Producto</th>
                  <th>Lote</th>
                  <th style="width: 90px;" class="text-right">Cant.</th>
                  <th style="width: 140px;">Fecha merma</th>
                  <th>Motivo</th>
                  <th>Detalle</th>
                  <th style="width: 140px;">Registrado por</th>
                  <th
                    *ngIf="isAdmin"
                    class="text-right"
                    style="width: 140px;"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of mermas">
                  <td>{{ m.producto_nombre || ('#' + m.producto_id) }}</td>
                  <td>{{ m.lote || '—' }}</td>
                  <td class="text-right">{{ m.cantidad }}</td>
                  <td>
                    {{
                      m.fecha_merma
                        ? (m.fecha_merma | date: 'dd/MM/yyyy')
                        : '—'
                    }}
                  </td>
                  <td>{{ m.motivo }}</td>
                  <td>{{ m.detalle || '—' }}</td>
                  <td>{{ m.registrado_por_nombre || ('#' + m.registrado_por) }}</td>
                  <td class="text-right" *ngIf="isAdmin">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      (click)="eliminarMerma(m)"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            *ngIf="!cargando && !mermas.length"
            class="p-4 text-center text-muted"
          >
            No hay mermas registradas todavía.
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MermasListaComponent implements OnInit {
  mermas: Merma[] = [];
  productos: Producto[] = [];
  usuarios: AppUser[] = [];

  cargando = false;
  guardando = false;
  error: string | null = null;
  mostrarErrorCampos = false;

  nuevoVisible = false;
  nuevo: NuevaMermaForm = this.crearModeloNuevo();

  constructor(
    private mermasService: MermasService,
    private productosService: ProductosService,
    private usuariosService: UsuariosService,
    private auth: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    this.cargarMermas();
    this.cargarProductos();
    this.cargarUsuarios();
  }

  private crearModeloNuevo(): NuevaMermaForm {
    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return {
      producto_id: null,
      lote: '',
      cantidad: null,
      motivo: '',
      detalle: '',
      fecha_merma: hoy,
      registrado_por: null,
    };
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

  cargarMermas(): void {
    this.cargando = true;
    this.error = null;

    this.mermasService.list().subscribe({
      next: (data) => {
        this.mermas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar mermas', err);
        this.error = 'No se pudo cargar el listado de mermas.';
        this.cargando = false;
      },
    });
  }

  cargarProductos(): void {
    this.productosService.list().subscribe({
      next: (data) => (this.productos = data),
      error: (err) =>
        console.error('Error al cargar productos para mermas', err),
    });
  }

  cargarUsuarios(): void {
    this.usuariosService.list().subscribe({
      next: (data) => (this.usuarios = data),
      error: (err) =>
        console.error('Error al cargar usuarios para mermas', err),
    });
  }

  guardarNuevaMerma(): void {
    if (!this.isAdmin) return;

    const n = this.nuevo;

    if (
      !n.producto_id ||
      !n.cantidad ||
      n.cantidad <= 0 ||
      !n.motivo ||
      !n.fecha_merma ||
      !n.registrado_por
    ) {
      this.mostrarErrorCampos = true;
      this.error = 'Faltan datos obligatorios por completar.';
      return;
    }

    this.mostrarErrorCampos = false;
    this.error = null;
    this.guardando = true;

    this.mermasService
      .create({
        producto_id: n.producto_id,
        lote: n.lote || null,
        cantidad: n.cantidad,
        motivo: n.motivo,
        detalle: n.detalle || null,
        fecha_merma: n.fecha_merma,
        registrado_por: n.registrado_por,
      } as any)
      .subscribe({
        next: () => {
          this.guardando = false;
          this.nuevoVisible = false;
          this.nuevo = this.crearModeloNuevo();
          this.cargarMermas();
        },
        error: (err) => {
          console.error('Error al crear merma', err);
          this.error = 'No se pudo registrar la merma.';
          this.guardando = false;
        },
      });
  }

  eliminarMerma(m: Merma): void {
    if (!this.isAdmin || !m.id) return;

    const seguro = confirm(
      `¿Seguro que quieres eliminar la merma #${m.id} del producto "${m.producto_nombre || m.producto_id}"?`
    );
    if (!seguro) return;

    this.error = null;

    this.mermasService.remove(m.id).subscribe({
      next: () => {
        this.mermas = this.mermas.filter((x) => x.id !== m.id);
      },
      error: (err) => {
        console.error('Error al eliminar merma', err);
        this.error = 'No se pudo eliminar la merma.';
      },
    });
  }
}
