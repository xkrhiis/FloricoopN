// src/app/features/usuarios/pages/usuarios-lista/usuarios-lista.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  UsuariosService,
  AppUser,
} from '../../../../core/services/usuarios.service';
import { AuthService } from '../../../../core/services/auth';

type Rol = 'admin' | 'user';

type NuevoUsuarioForm = {
  username: string;
  password: string;
  role: Rol;
};

type EditUsuarioForm = {
  id: number;
  username: string;
  role: Rol;
};

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="container-fluid py-4">
      <!-- Título -->
      <div class="mb-4">
        <h1 class="h3 font-weight-bold mb-1" style="color: var(--fc-primary-600)">
          Usuarios
        </h1>
        <p class="text-muted mb-0">Lista de usuarios registrados.</p>
      </div>

      <div class="card shadow-sm border-0">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <div>
            <h5 class="mb-0">Usuarios registrados</h5>
            <small class="text-muted">
              Gestión básica de cuentas de la cooperativa.
            </small>
          </div>

          <button
            *ngIf="isAdmin"
            type="button"
            class="btn btn-sm"
            [ngClass]="nuevoVisible ? 'btn-outline-secondary' : 'btn-success'"
            (click)="toggleNuevo()"
          >
            <ng-container *ngIf="!nuevoVisible">
              + Nuevo usuario
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

        <!-- Formulario nuevo usuario -->
        <div class="border-bottom px-3 py-3 bg-light" *ngIf="nuevoVisible && isAdmin">
          <form
            (ngSubmit)="guardarNuevo()"
            #fNuevo="ngForm"
            class="row g-3 align-items-end"
          >
            <div class="col-md-4 mb-2">
              <label class="form-label small text-muted">
                Nombre de usuario <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="nuevo.username"
                name="nuevo-username"
                required
              />
            </div>

            <div class="col-md-4 mb-2">
              <label class="form-label small text-muted">
                Contraseña <span class="text-danger">*</span>
              </label>
              <input
                type="password"
                class="form-control"
                [(ngModel)]="nuevo.password"
                name="nuevo-password"
                required
              />
            </div>

            <div class="col-md-3 mb-2">
              <label class="form-label small text-muted">
                Rol <span class="text-danger">*</span>
              </label>
              <select
                class="form-control"
                [(ngModel)]="nuevo.role"
                name="nuevo-role"
                required
              >
                <option value="admin">Administrador</option>
                <option value="user">Usuario</option>
              </select>
            </div>

            <div class="col-md-1 mb-2 d-flex justify-content-end">
              <button
                type="submit"
                class="btn btn-success"
                [disabled]="guardando"
              >
                <span
                  *ngIf="guardando"
                  class="spinner-border spinner-border-sm mr-1"
                ></span>
                Guardar
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
            Cargando usuarios...
          </div>

          <div class="table-responsive" *ngIf="!cargando && usuarios.length">
            <table class="table table-hover mb-0 align-middle">
              <thead class="thead-light">
                <tr>
                  <th style="width: 80px;">ID</th>
                  <th>Usuario</th>
                  <th style="width: 160px;">Rol</th>
                  <th style="width: 190px;">Creado</th>
                  <th class="text-right" style="width: 190px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of usuarios">
                  <!-- Fila en edición -->
                  <ng-container *ngIf="editandoId === u.id && editando; else filaNormal">
                    <td>#{{ u.id }}</td>
                    <td>
                      <input
                        type="text"
                        class="form-control form-control-sm"
                        [(ngModel)]="editando!.username"
                        name="edit-username-{{ u.id }}"
                      />
                    </td>
                    <td>
                      <select
                        class="form-control form-control-sm"
                        [(ngModel)]="editando!.role"
                        name="edit-role-{{ u.id }}"
                      >
                        <option value="admin">Administrador</option>
                        <option value="user">Usuario</option>
                      </select>
                    </td>
                    <td>
                      {{
                        u.created_at
                          ? (u.created_at | date: 'dd/MM/yyyy HH:mm')
                          : '—'
                      }}
                    </td>
                    <td class="text-right">
                      <button
                        type="button"
                        class="btn btn-sm btn-success mr-2"
                        (click)="guardarEdicion()"
                        [disabled]="guardando"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary"
                        (click)="cancelarEdicion()"
                        [disabled]="guardando"
                      >
                        Cancelar
                      </button>
                    </td>
                  </ng-container>

                  <!-- Fila normal -->
                  <ng-template #filaNormal>
                    <td>#{{ u.id }}</td>
                    <td>
                      <i class="fas fa-user mr-1 text-muted"></i>
                      {{ u.username }}
                    </td>
                    <td>
                      <span
                        class="badge"
                        [ngClass]="
                          u.role === 'admin' ? 'badge-primary' : 'badge-secondary'
                        "
                      >
                        {{ u.role === 'admin' ? 'Administrador' : 'Usuario' }}
                      </span>
                    </td>
                    <td>
                      {{
                        u.created_at
                          ? (u.created_at | date: 'dd/MM/yyyy HH:mm')
                          : '—'
                      }}
                    </td>
                    <td class="text-right">
                      <div class="table-actions d-inline-flex" *ngIf="isAdmin">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-secondary mr-2"
                          (click)="editarUsuario(u)"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-danger"
                          (click)="eliminarUsuario(u)"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </ng-template>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            *ngIf="!cargando && !usuarios.length"
            class="p-4 text-center text-muted"
          >
            No hay usuarios registrados todavía.
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UsuariosListaComponent implements OnInit {
  usuarios: AppUser[] = [];

  cargando = false;
  guardando = false;
  error: string | null = null;
  mostrarErrorCampos = false;

  nuevoVisible = false;
  nuevo: NuevoUsuarioForm = {
    username: '',
    password: '',
    role: 'user',
  };

  editandoId: number | null = null;
  editando: EditUsuarioForm | null = null;

  constructor(
    private usuariosService: UsuariosService,
    private auth: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = null;

    this.usuariosService.list().subscribe({
      next: (data: AppUser[]) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios', err);
        this.error = 'No se pudo cargar la lista de usuarios.';
        this.cargando = false;
      },
    });
  }

  toggleNuevo(): void {
    if (!this.isAdmin) return;

    this.nuevoVisible = !this.nuevoVisible;
    this.mostrarErrorCampos = false;
    this.error = null;

    if (this.nuevoVisible) {
      // salgo de modo edición si estoy editando
      this.editandoId = null;
      this.editando = null;
      this.nuevo = {
        username: '',
        password: '',
        role: 'user',
      };
    }
  }

  guardarNuevo(): void {
    if (!this.isAdmin) return;

    const n = this.nuevo;

    if (!n.username || !n.password || !n.role) {
      this.mostrarErrorCampos = true;
      this.error = 'Faltan datos obligatorios por completar.';
      return;
    }

    this.guardando = true;
    this.error = null;
    this.mostrarErrorCampos = false;

    this.usuariosService
      .create({
        username: n.username,
        password: n.password,
        role: n.role,
      })
      .subscribe({
        next: (resp: any) => {
          // resp tiene forma { id: number }
          this.guardando = false;
          this.nuevoVisible = false;
          this.nuevo = {
            username: '',
            password: '',
            role: 'user',
          };
          // recargo lista desde la API
          this.cargarUsuarios();
        },
        error: (err: any) => {
          console.error('Error al crear usuario', err);
          this.error = 'No se pudo crear el usuario.';
          this.guardando = false;
        },
      });
  }

  editarUsuario(u: AppUser): void {
    if (!this.isAdmin) return;

    this.error = null;
    this.mostrarErrorCampos = false;
    this.nuevoVisible = false;

    this.editandoId = u.id!;
    this.editando = {
      id: u.id!,
      username: u.username,
      role: (u.role as Rol) || 'user',
    };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editando = null;
    this.error = null;
  }

  guardarEdicion(): void {
    if (!this.isAdmin || !this.editando || !this.editandoId) return;

    const e = this.editando;

    if (!e.username || !e.role) {
      this.mostrarErrorCampos = true;
      this.error = 'Faltan datos obligatorios por completar.';
      return;
    }

    this.guardando = true;
    this.error = null;
    this.mostrarErrorCampos = false;

    this.usuariosService
      .update(this.editandoId, {
        username: e.username,
        role: e.role,
      })
      .subscribe({
        next: (_resp: any) => {
          // resp probablemente es { updated: true }
          this.guardando = false;
          this.editandoId = null;
          this.editando = null;
          this.cargarUsuarios();
        },
        error: (err: any) => {
          console.error('Error al actualizar usuario', err);
          this.error = 'No se pudo actualizar el usuario.';
          this.guardando = false;
        },
      });
  }

  eliminarUsuario(u: AppUser): void {
    if (!this.isAdmin || !u.id) return;

    const seguro = confirm(
      `¿Seguro que quieres eliminar al usuario "${u.username}" (#${u.id})?`
    );
    if (!seguro) return;

    this.error = null;

    this.usuariosService.remove(u.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter((x) => x.id !== u.id);
      },
      error: (err: any) => {
        console.error('Error al eliminar usuario', err);
        this.error = 'No se pudo eliminar el usuario.';
      },
    });
  }
}
