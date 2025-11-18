// src/app/features/dashboard/pages/dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  ProductosService,
  Producto,
} from '../../../../core/services/productos.service';
import { RegistrosService } from '../../../../core/services/registros.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, CurrencyPipe],
  template: `
    <div class="container-fluid py-4">

      <!-- ===========================
           FILA 1: KPIs PRINCIPALES
      ============================ -->
      <div class="row mb-4">
        <!-- Productos activos -->
        <div class="col-md-3 mb-3">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex flex-column">
              <div class="text-muted small mb-1">Productos activos</div>
              <div class="display-6 mb-1">{{ kpis.productosActivos }}</div>
              <div class="text-muted small mt-auto">
                Incluye todos los colores y lotes.
              </div>
            </div>
          </div>
        </div>

        <!-- Stock total -->
        <div class="col-md-3 mb-3">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex flex-column">
              <div class="text-muted small mb-1">Stock total (unidades)</div>
              <div class="display-6 mb-1">{{ kpis.stockTotal }}</div>
              <div
                class="small mt-auto"
                [ngClass]="{
                  'text-success': stockSubtexto === 'Actualizado',
                  'text-warning': stockSubtexto === 'Revisar movimientos'
                }"
              >
                {{ stockSubtexto }}
              </div>
            </div>
          </div>
        </div>

        <!-- Valor total inventario -->
        <div class="col-md-3 mb-3">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex flex-column">
              <div class="text-muted small mb-1">Valor total inventario (CLP)</div>
              <div class="h3 mb-1">
                {{ kpis.valorTotal | currency:'CLP':'symbol-narrow':'1.0-0' }}
              </div>
              <div class="text-muted small mt-auto">
                Estimado a precio de entrada.
              </div>
            </div>
          </div>
        </div>

        <!-- Mermas del mes -->
        <div class="col-md-3 mb-3">
          <div
            class="card h-100 shadow-sm border-0"
            [ngClass]="{
              'bg-light': mermaPorcentaje === 0,
              'bg-warning-subtle': mermaPorcentaje > 0 && mermaPorcentaje < 10,
              'bg-danger-subtle': mermaPorcentaje >= 10
            }"
          >
            <div class="card-body d-flex flex-column">
              <div class="text-muted small mb-1">Mermas del mes</div>

              <div class="h5 mb-0">
                {{ kpis.mermasUnidadesMes }} unidades
              </div>
              <div class="small mb-2">
                {{ kpis.mermasMontoMes | currency:'CLP':'symbol-narrow':'1.0-0' }}
                perdidos
              </div>

              <div class="small mt-auto text-muted" *ngIf="mermaPorcentaje > 0">
                {{ mermaPorcentaje | number:'1.0-1' }}% del stock del mes
              </div>
              <div class="small mt-auto text-muted" *ngIf="mermaPorcentaje === 0">
                Sin mermas registradas este mes.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Texto pequeño de última actualización -->
      <div class="row mb-3" *ngIf="kpis.ultimaActualizacion">
        <div class="col text-end text-muted small">
          Última actualización de inventario:
          {{
            kpis.ultimaActualizacion
              | date:'dd/MM/yyyy HH:mm'
          }} hrs
        </div>
      </div>

      <!-- ===========================
           FILA 2: ALERTAS + ACTIVIDAD
      ============================ -->
      <div class="row">
        <!-- ALERTAS -->
        <div class="col-lg-8 mb-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white border-0">
              <h5 class="mb-1">Alertas de inventario</h5>
              <div class="text-muted small">
                Productos bajo mínimo, próximos a vencer y mermas recientes.
              </div>
            </div>

            <div class="card-body">
             <!-- Menú de pestañas de Alertas (estilo Floricoop) -->
<div class="fc-alert-tabs mb-3">
  <button
    type="button"
    class="fc-alert-tab"
    [class.fc-alert-tab--active]="alertaTab === 'minimo'"
    (click)="alertaTab = 'minimo'"
  >
    Bajo mínimo
  </button>

  <button
    type="button"
    class="fc-alert-tab"
    [class.fc-alert-tab--active]="alertaTab === 'vencimiento'"
    (click)="alertaTab = 'vencimiento'"
  >
    Próximos a vencer
  </button>

  <button
    type="button"
    class="fc-alert-tab"
    [class.fc-alert-tab--active]="alertaTab === 'mermas'"
    (click)="alertaTab = 'mermas'"
  >
    Mermas recientes
  </button>
</div>


              <!-- Bajo mínimo -->
              <div *ngIf="alertaTab === 'minimo'">
                <ng-container *ngIf="alertas.bajoMinimo.length; else todoOkMinimo">
                  <div class="table-responsive">
                    <table class="table table-sm mb-2 align-middle">
                      <thead class="table-light">
                        <tr>
                          <th>Producto</th>
                          <th>Lote</th>
                          <th class="text-end">Stock</th>
                          <th class="text-end">Mínimo</th>
                          <th class="text-end">Diferencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let p of alertas.bajoMinimo">
                          <td>{{ p.nombre }}</td>
                          <td>{{ p.lote || '—' }}</td>
                          <td class="text-end">{{ p.stock ?? 0 }}</td>
                          <td class="text-end">{{ p.min ?? 0 }}</td>
                          <td class="text-end text-danger">
                            {{ (p.stock ?? 0) - (p.min ?? 0) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="text-end">
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      routerLink="/inventario"
                    >
                      Ver todos
                    </button>
                  </div>
                </ng-container>

                <ng-template #todoOkMinimo>
                  <div class="text-muted">
                    ✅ Todo bien: no hay ítems bajo el mínimo.
                  </div>
                </ng-template>
              </div>

              <!-- Próximos a vencer -->
              <div *ngIf="alertaTab === 'vencimiento'">
                <ng-container
                  *ngIf="alertas.proximosAVencer.length; else noVencimientos"
                >
                  <div class="table-responsive">
                    <table class="table table-sm mb-2 align-middle">
                      <thead class="table-light">
                        <tr>
                          <th>Producto</th>
                          <th>Lote</th>
                          <th class="text-end">Cantidad</th>
                          <th>Fecha límite</th>
                          <th class="text-end">Días restantes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let p of alertas.proximosAVencer">
                          <td>{{ p.nombre }}</td>
                          <td>{{ p.lote || '—' }}</td>
                          <td class="text-end">{{ p.stock ?? 0 }}</td>
                          <td>
                            {{ p.fecha_limite | date:'dd/MM/yyyy' }}
                          </td>
                          <td class="text-end">
                            {{ diasRestantes(p.fecha_limite) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="text-end">
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      routerLink="/inventario"
                    >
                      Ver todos
                    </button>
                  </div>
                </ng-container>

                <ng-template #noVencimientos>
                  <div class="text-muted">
                    📅 No hay productos próximos a vencer.
                  </div>
                </ng-template>
              </div>

              <!-- Mermas recientes -->
              <div *ngIf="alertaTab === 'mermas'">
                <ng-container
                  *ngIf="alertas.mermasRecientes.length; else noMermasRecientes"
                >
                  <div class="table-responsive">
                    <table class="table table-sm mb-2 align-middle">
                      <thead class="table-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Producto</th>
                          <th>Lote</th>
                          <th class="text-end">Cantidad</th>
                          <th class="text-end">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let r of alertas.mermasRecientes">
                          <td>
                            {{ r.fecha_registro | date:'dd/MM HH:mm' }}
                          </td>
                          <td>{{ r.producto }}</td>
                          <td>{{ r.lote || '—' }}</td>
                          <td class="text-end">
                            {{ r.cantidad }}
                          </td>
                          <td class="text-end">
                            {{
                              (r.cantidad * r.precio_unitario)
                                | currency:'CLP':'symbol-narrow':'1.0-0'
                            }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="text-end">
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      routerLink="/historial"
                    >
                      Ver historial completo
                    </button>
                  </div>
                </ng-container>

                <ng-template #noMermasRecientes>
                  <div class="text-muted">
                    🧾 No hay mermas registradas recientemente.
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </div>

        <!-- ACTIVIDAD RECIENTE -->
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white border-0">
              <h5 class="mb-1">Últimos movimientos</h5>
              <div class="text-muted small">
                Entradas, salidas y mermas recientes del inventario.
              </div>
            </div>

            <div class="card-body">
              <ng-container *ngIf="actividadReciente.length; else sinActividad">
                <div class="table-responsive">
                  <table class="table table-sm mb-2 align-middle">
                    <thead class="table-light">
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Producto</th>
                        <th class="text-end">Cant.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let r of actividadReciente">
                        <td class="small">
                          {{ r.fecha_registro | date:'dd/MM HH:mm' }}
                        </td>
                        <td class="small">
                          <span
                            class="badge"
                            [ngClass]="{
                              'bg-success-subtle text-success-emphasis': r.tipo === 'ENTRADA',
                              'bg-info-subtle text-info-emphasis': r.tipo === 'SALIDA',
                              'bg-danger-subtle text-danger-emphasis': r.tipo === 'MERMA'
                            }"
                          >
                            {{ r.tipo || 'MOV' }}
                          </span>
                        </td>
                        <td class="small">
                          {{ r.producto }}
                          <span class="text-muted" *ngIf="r.lote">
                            ({{ r.lote }})
                          </span>
                        </td>
                        <td class="text-end small">
                          <span
                            [ngClass]="{
                              'text-success': r.cantidad > 0,
                              'text-danger': r.cantidad < 0
                            }"
                          >
                            {{ r.cantidad > 0 ? '+' : '' }}{{ r.cantidad }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="text-end">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    routerLink="/historial"
                  >
                    Ver historial completo
                  </button>
                </div>
              </ng-container>

              <ng-template #sinActividad>
                <div class="text-muted">
                  Aún no hay movimientos registrados en el historial.
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje de error general -->
      <div *ngIf="error" class="alert alert-danger mt-3">
        {{ error }}
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  productos: Producto[] = [];
  registros: any[] = [];

  loading = false;
  error: string | null = null;

  // KPIs
  kpis = {
    productosActivos: 0,
    stockTotal: 0,
    valorTotal: 0,
    mermasUnidadesMes: 0,
    mermasMontoMes: 0,
    ultimaActualizacion: null as Date | null,
  };

  // Alertas
  alertas = {
    bajoMinimo: [] as Producto[],
    proximosAVencer: [] as Producto[],
    mermasRecientes: [] as any[],
  };

  // Últimos movimientos
  actividadReciente: any[] = [];

  // Tab seleccionado en alertas
  alertaTab: 'minimo' | 'vencimiento' | 'mermas' = 'minimo';

  constructor(
    private productosService: ProductosService,
    private registrosService: RegistrosService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /** Texto dinámico de la card de stock total */
  get stockSubtexto(): string {
    if (!this.kpis.ultimaActualizacion) return 'Sin registros aún';

    const hoy = new Date();
    const u = this.kpis.ultimaActualizacion;

    if (
      u.getFullYear() === hoy.getFullYear() &&
      u.getMonth() === hoy.getMonth() &&
      u.getDate() === hoy.getDate()
    ) {
      return 'Actualizado';
    }
    return 'Revisar movimientos';
  }

  /** % de merma respecto al stock total del mes */
  get mermaPorcentaje(): number {
    if (this.kpis.stockTotal <= 0) return 0;
    return (
      (this.kpis.mermasUnidadesMes /
        (this.kpis.stockTotal + this.kpis.mermasUnidadesMes || 1)) * 100
    );
  }

  /** Cargar productos + registros en paralelo */
  private cargarDatos(): void {
    this.loading = true;
    this.error = null;

    forkJoin([
      this.productosService.list(),
      this.registrosService.list(),
    ]).subscribe({
      next: ([productos, registros]) => {
        this.productos = productos;
        this.registros = registros;
        this.calcularKpis();
        this.calcularAlertas();
        this.calcularActividadReciente();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard', err);
        this.error = 'No se pudo cargar el resumen de inventario.';
        this.loading = false;
      },
    });
  }

  /** Calcula KPIs generales */
  private calcularKpis(): void {
    const productosConStock = this.productos.filter(
      (p) => (p.stock ?? 0) > 0
    );

    this.kpis.productosActivos = productosConStock.length;
    this.kpis.stockTotal = productosConStock.reduce(
      (acc, p) => acc + (p.stock ?? 0),
      0
    );
    this.kpis.valorTotal = productosConStock.reduce(
      (acc, p) => acc + p.precio * (p.stock ?? 0),
      0
    );

    // Última actualización = max(fecha_ingreso productos, fecha_registro registros)
    const fechas: Date[] = [];

    for (const p of this.productos) {
      const d = this.parseDate(p.fecha_ingreso);
      if (d) fechas.push(d);
    }
    for (const r of this.registros) {
      const d = this.parseDate(r.fecha_registro);
      if (d) fechas.push(d);
    }

    this.kpis.ultimaActualizacion = fechas.length
      ? fechas.reduce((max, d) => (d > max ? d : max), fechas[0])
      : null;

    // Mermas del mes (asumimos registros con tipo === 'MERMA')
    const ahora = new Date();
    const mes = ahora.getMonth();
    const anio = ahora.getFullYear();

    const mermasMes = this.registros.filter((r) => {
      if (r.tipo !== 'MERMA') return false;
      const d = this.parseDate(r.fecha_registro);
      if (!d) return false;
      return d.getMonth() === mes && d.getFullYear() === anio;
    });

    this.kpis.mermasUnidadesMes = mermasMes.reduce(
      (acc, r) => acc + Math.abs(r.cantidad ?? 0),
      0
    );
    this.kpis.mermasMontoMes = mermasMes.reduce(
      (acc, r) =>
        acc + Math.abs(r.cantidad ?? 0) * (r.precio_unitario ?? 0),
      0
    );
  }

  /** Calcula datos para el panel de alertas */
  private calcularAlertas(): void {
    // Bajo mínimo
    this.alertas.bajoMinimo = this.productos
      .filter((p) => (p.stock ?? 0) < (p.min ?? 0))
      .sort(
        (a, b) => (a.stock ?? 0) - (b.stock ?? 0)
      )
      .slice(0, 5);

    // Próximos a vencer (ej: dentro de 30 días)
    const hoy = new Date();
    const diasVentana = 30;

    this.alertas.proximosAVencer = this.productos
      .filter((p) => {
        const d = this.parseDate(p.fecha_limite);
        if (!d) return false;
        const diffMs = d.getTime() - hoy.getTime();
        const diffDias = diffMs / (1000 * 60 * 60 * 24);
        return diffDias >= 0 && diffDias <= diasVentana;
      })
      .sort((a, b) => {
        const da = this.parseDate(a.fecha_limite)?.getTime() ?? 0;
        const db = this.parseDate(b.fecha_limite)?.getTime() ?? 0;
        return da - db;
      })
      .slice(0, 5);

    // Mermas recientes
    this.alertas.mermasRecientes = this.registros
      .filter((r) => r.tipo === 'MERMA')
      .sort(
        (a, b) =>
          (this.parseDate(b.fecha_registro)?.getTime() ?? 0) -
          (this.parseDate(a.fecha_registro)?.getTime() ?? 0)
      )
      .slice(0, 5);
  }

  /** Calcula la tabla de últimos movimientos */
  private calcularActividadReciente(): void {
    this.actividadReciente = [...this.registros]
      .sort(
        (a, b) =>
          (this.parseDate(b.fecha_registro)?.getTime() ?? 0) -
          (this.parseDate(a.fecha_registro)?.getTime() ?? 0)
      )
      .slice(0, 10);
  }

  /** Días restantes hasta una fecha */
  diasRestantes(fecha: string | null | undefined): number {
    const d = this.parseDate(fecha);
    if (!d) return 0;
    const hoy = new Date();
    const diffMs = d.getTime() - hoy.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /** Helper: parsear fechas seguras */
  private parseDate(value: any): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
}
