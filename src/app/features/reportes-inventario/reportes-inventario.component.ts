// src/app/features/reportes-inventario/reportes-inventario.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ProductosService, Producto } from '../../core/services/productos.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reportes-inventario',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  template: `
    <div class="container-fluid py-4">

      <!-- Encabezado -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 font-weight-bold mb-1" style="color:#4b0082">
            Reportes de Inventario
          </h1>
          <p class="text-muted mb-0">
            Resumen visual del inventario y generación de reporte en PDF
            basado en los datos actuales de <code>/api/productos</code>.
          </p>
        </div>

        <button
          type="button"
          class="btn btn-outline-primary"
          (click)="descargarPdf()"
          [disabled]="cargando || !productos.length"
        >
          <i class="fas fa-file-download mr-2"></i>
          Descargar reporte PDF
        </button>
      </div>

      <!-- Resumen -->
      <div class="row mb-4" *ngIf="productos.length">
        <div class="col-md-4 mb-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Total de productos</div>
              <div class="h3 mb-0">{{ totalProductos }}</div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Stock total</div>
              <div class="h3 mb-0">{{ totalStock }}</div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Valor total estimado</div>
              <div class="h4 mb-0">
                {{ totalValor | currency:'CLP':'symbol-narrow':'1.0-0' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de carga / error -->
      <div *ngIf="cargando" class="p-3 text-center text-muted">
        <span class="mr-2"><i class="fas fa-circle-notch fa-spin"></i></span>
        Cargando datos de inventario...
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Tabla de detalle -->
      <div class="card shadow-sm border-0" *ngIf="!cargando && productos.length">
        <div class="card-header">
          <h5 class="mb-0">Detalle de productos incluidos en el reporte</h5>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="thead-light">
                <tr>
                  <th>Producto</th>
                  <th>Lote</th>
                  <th>Color</th>
                  <th class="text-right">Precio unitario</th>
                  <th class="text-right">Stock</th>
                  <th class="text-right">Mínimo</th>
                  <th>Fecha ingreso</th>
                  <th>Fecha límite</th>
                  <th class="text-right">Precio total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of productos">
                  <td>{{ p.nombre }}</td>
                  <td>{{ p.lote || '—' }}</td>
                  <td>{{ p.color || '—' }}</td>

                  <td class="text-right">
                    {{ p.precio | currency:'CLP':'symbol-narrow':'1.0-0' }}
                  </td>

                  <td class="text-right">
                    {{ p.stock ?? 0 }}
                  </td>

                  <td class="text-right">
                    {{ p.min ?? 0 }}
                  </td>

                  <td>
                    {{
                      p.fecha_ingreso
                        ? (p.fecha_ingreso | date:'dd/MM/yyyy')
                        : '—'
                    }}
                  </td>

                  <td>
                    {{
                      p.fecha_limite
                        ? (p.fecha_limite | date:'dd/MM/yyyy')
                        : '—'
                    }}
                  </td>

                  <td class="text-right">
                    {{
                      (p.precio * (p.stock || 0))
                        | currency:'CLP':'symbol-narrow':'1.0-0'
                    }}
                  </td>

                  <td>
                    <span
                      class="badge"
                      [ngClass]="p.activo ? 'badge-success' : 'badge-secondary'"
                    >
                      {{ p.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sin datos -->
      <div
        *ngIf="!cargando && !productos.length && !error"
        class="p-4 text-center text-muted"
      >
        No hay productos registrados para generar el reporte.
      </div>
    </div>
  `,
})
export class ReportesInventarioComponent implements OnInit {
  productos: Producto[] = [];
  cargando = false;
  error: string | null = null;

  totalProductos = 0;
  totalStock = 0;
  totalValor = 0;

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    this.productosService.list().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
        this.calcularResumen();
      },
      error: (err) => {
        console.error('Error al cargar productos para el reporte', err);
        this.error = 'No se pudieron cargar los datos de inventario.';
        this.cargando = false;
      },
    });
  }

  private calcularResumen(): void {
    this.totalProductos = this.productos.length;
    this.totalStock = this.productos.reduce(
      (acc, p) => acc + (p.stock ?? 0),
      0
    );
    this.totalValor = this.productos.reduce(
      (acc, p) => acc + (p.precio * (p.stock || 0)),
      0
    );
  }

  // ---- Generación de PDF ----
  descargarPdf(): void {
    if (!this.productos.length) {
      return;
    }

    const doc = new jsPDF('p', 'pt', 'a4');

    // Encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(75, 0, 130);
    doc.text('FloriCoop - Reporte de Inventario', 40, 40);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const ahora = new Date();
    doc.text(
      `Generado: ${ahora.toLocaleString('es-CL')}`,
      40,
      58
    );

    // Resumen
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const resumenY = 80;
    doc.text(`Total de productos: ${this.totalProductos}`, 40, resumenY);
    doc.text(`Stock total: ${this.totalStock}`, 40, resumenY + 14);
    doc.text(
      `Valor total estimado: ${this.formatoMonedaCLP(this.totalValor)}`,
      40,
      resumenY + 28
    );

    // Tabla de detalle
    const body = this.productos.map((p) => [
      p.nombre,
      p.lote || '',
      p.color || '',
      this.formatoMonedaCLP(p.precio),
      p.stock ?? 0,
      p.min ?? 0,
      p.fecha_ingreso ? this.formatearFecha(p.fecha_ingreso) : '',
      p.fecha_limite ? this.formatearFecha(p.fecha_limite) : '',
      this.formatoMonedaCLP(p.precio * (p.stock || 0)),
      p.activo ? 'Activo' : 'Inactivo',
    ]);

    autoTable(doc, {
      startY: resumenY + 60,
      head: [[
        'Producto',
        'Lote',
        'Color',
        'Precio unitario',
        'Stock',
        'Mínimo',
        'Fecha ingreso',
        'Fecha límite',
        'Precio total',
        'Estado',
      ]],
      body,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [75, 0, 130],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 40, right: 40 },
    });

    doc.save('reporte-inventario-floricoop.pdf');
  }

  private formatoMonedaCLP(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  private formatearFecha(valor: string | null): string {
    if (!valor) return '';
    return new Date(valor).toLocaleDateString('es-CL');
  }
}
