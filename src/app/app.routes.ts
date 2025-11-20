// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Layout principal
import { ShellComponent } from './layout/shell/shell';

// Guards
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin.guard';

// Auth
import { LoginComponent } from './features/auth/pages/login/login';

// Dashboard
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard';

// Inventario
import { ProductosListaComponent } from './features/inventario/pages/productos-lista/productos-lista';

// Usuarios
import { UsuariosListaComponent } from './features/usuarios/pages/usuarios-lista/usuarios-lista';

// Historial / Reportes
import { HistorialInventarioComponent } from './features/historial-inventario/historial-inventario.component';
import { ReportesInventarioComponent } from './features/reportes-inventario/reportes-inventario.component';

// Mermas
import { MermasListaComponent } from './features/mermas/pages/mermas-lista/mermas-lista';

export const routes: Routes = [
  // 1) LOGIN (pública)
  {
    path: 'auth/login',
    component: LoginComponent,
  },

  // 2) ZONA PRIVADA (dentro del Shell)
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard], // debe estar logueado
    children: [
      // Dashboard
      { path: 'dashboard', component: DashboardComponent },

      // 👇 SOLO ADMIN: Inventario
      {
        path: 'inventario',
        component: ProductosListaComponent,
        canActivate: [adminGuard],
      },

      // 👇 SOLO ADMIN: Control de mermas
      {
        path: 'mermas',
        component: MermasListaComponent,
        canActivate: [adminGuard],
      },

      // 👇 SOLO ADMIN: Gestión de usuarios
      {
        path: 'usuarios',
        component: UsuariosListaComponent,
        canActivate: [adminGuard],
      },

      // Historial (para cualquier usuario autenticado)
      {
        path: 'historial',
        component: HistorialInventarioComponent,
      },

      // Reportes
      {
        path: 'reportes',
        component: ReportesInventarioComponent,
      },

      // Redirección por defecto
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },

  // 3) Cualquier otra ruta → raíz
  { path: '**', redirectTo: '' },
];
