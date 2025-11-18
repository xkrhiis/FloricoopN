// src/app/features/usuarios/pages/usuarios-lista/usuarios-lista.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { UsuariosService } from '../../../../core/services/usuarios.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="container-fluid py-4">
      <!-- Título -->
      <div class="mb-4">
        <h1
          class="h3 font-weight-bold mb-1"
          style="color: var(--fc-primary-600)"
        >
          Usuarios
        </h1>
        <p class="text-muted mb-0">
          Lista de usuarios registrados.
        </p>
      </div>

      <!-- Tarjeta principal -->
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

          <!-- Botón solo ADMIN -->
          <button
            *ngIf="isAdmin"
            type="button"
            class="btn btn-sm btn-success"
            (click)="nuevoUsuario()"
          >
            <i class="fas fa-user-plus mr-1"></i>
            Nuevo usuario
          </button>
        </div>

        <div class="card-body p-0">
          <!-- Cargando -->
          <div *ngIf="cargando" class="p-3 text-center text-muted">
            <span class="mr-2">
              <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            Cargando usuarios...
          </div>

          <!-- Error -->
          <div *ngIf="error" class="alert alert-danger m-3 mb-0">
            {{ error }}
          </div>

          <!-- Tabla de usuarios -->
          <div class="table-responsive" *ngIf="!cargando && usuarios.length">
            <table class="table mb-0 align-middle">
              <thead class="thead-light">
                <tr>
                  <th style="width: 70px;">ID</th>
                  <th>Usuario</th>
                  <th style="width: 160px;">Rol</th>
                  <th style="width: 180px;">Creado</th>
                  <th
                    *ngIf="isAdmin"
                    class="text-right"
                    style="width: 180px;"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of usuarios">
                  <td>#{{ u.id }}</td>
                  <td>
                    <i class="fas fa-user mr-2 text-muted"></i>
                    {{ u.username }}
                  </td>

                  <!-- Badge de rol (admin / usuario) -->
                  <td>
                    <span
                      class="badge"
                      [ngClass]="
                        u.role === 'admin'
                          ? 'badge-primary'
                          : 'badge-secondary'
                      "
                    >
                      {{ u.role === 'admin' ? 'Administrador' : 'Usuario' }}
                    </span>
                  </td>

                  <!-- Fecha de creación -->
                  <td>
                    {{
                      u.created_at
                        ? (u.created_at | date: 'dd/MM/yyyy HH:mm')
                        : '—'
                    }}
                  </td>

                  <!-- Acciones -->
                  <td class="text-right" *ngIf="isAdmin">
                    <div class="d-inline-flex">
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
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Sin datos -->
          <div
            *ngIf="!cargando && !usuarios.length && !error"
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
  // uso "any" para no pelearme con la interfaz exacta del backend
  usuarios: any[] = [];

  cargando = false;
  error: string | null = null;

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

  /** Cargar usuarios desde la API */
  cargarUsuarios(): void {
    this.cargando = true;
    this.error = null;

    this.usuariosService.list().subscribe({
      next: (data: any[]) => {
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

  /** Placeholder para alta de usuario */
  nuevoUsuario(): void {
    alert('Función "Nuevo usuario" pendiente de implementar 😊');
  }

  /** Placeholder para edición */
  editarUsuario(_u: any): void {
    alert('Función de edición de usuario pendiente de implementar 😊');
  }

  /** Eliminar usuario (solo admin) */
  eliminarUsuario(u: any): void {
    if (!this.isAdmin || !u.id) return;

    const seguro = confirm(
      `¿Seguro que quieres eliminar al usuario "${u.username}" (#${u.id})?`
    );
    if (!seguro) return;

    this.error = null;

    if (!this.usuariosService.remove) {
      // Por si tu servicio aún no tiene remove, evitamos que falle
      alert('Falta implementar usuariosService.remove(id) en el backend.');
      return;
    }

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
