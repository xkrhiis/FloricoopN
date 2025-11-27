// src/app/features/reportes-inventario/reportes-inventario.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosService, Producto } from '../../core/services/productos.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Chart.js
import {
  Chart,
  ChartConfiguration,
  registerables,
} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reportes-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-inventario.component.html',
})
export class ReportesInventarioComponent implements OnInit, AfterViewInit {
  @ViewChild('stockChart') stockChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('estadoChart') estadoChartRef!: ElementRef<HTMLCanvasElement>;

  private stockChart?: Chart;
  private estadoChart?: Chart;

  productos: Producto[] = [];
  cargando = false;
  error: string | null = null;

  totalProductos = 0;
  totalStock = 0;
  totalValor = 0;
  precioPromedio = 0;

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    // Solo log para confirmar que la vista está lista
    console.log('ReportesInventario: vista inicializada');
  }

  private cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    this.productosService.list().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
        this.calcularResumen();

        console.log('Productos cargados:', this.productos);

        // Esperamos un tick para asegurarnos de que los canvas están en el DOM
        setTimeout(() => {
          this.construirGraficos();
        }, 0);
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
    this.precioPromedio =
      this.totalProductos > 0 ? this.totalValor / this.totalProductos : 0;
  }

  private construirGraficos(): void {
    // Si no hay productos, no hacemos nada
    if (!this.productos.length) {
      console.log('No hay productos para graficar');
      return;
    }

    // Destruir gráficos previos si se vuelven a crear
    if (this.stockChart) {
      this.stockChart.destroy();
    }
    if (this.estadoChart) {
      this.estadoChart.destroy();
    }

    // ---- Preparar datos agregados ----
    const mapaStockPorCategoria = new Map<string, number>();
    const mapaValorPorEstado = new Map<string, number>();

    for (const p of this.productos) {
      const stock = p.stock ?? 0;
      const precio = p.precio ?? 0;

      const categoria = p.nombre || 'Sin nombre';
      const estado = this.obtenerEstado(p);

      // Stock por categoría (por producto)
      mapaStockPorCategoria.set(
        categoria,
        (mapaStockPorCategoria.get(categoria) ?? 0) + stock
      );

      // Valor total por estado
      const valor = stock * precio;
      mapaValorPorEstado.set(
        estado,
        (mapaValorPorEstado.get(estado) ?? 0) + valor
      );
    }

    const categorias = Array.from(mapaStockPorCategoria.keys());
    const cantidades = Array.from(mapaStockPorCategoria.values());

    const estados = Array.from(mapaValorPorEstado.keys());
    const valores = Array.from(mapaValorPorEstado.values());

    console.log('Datos gráfico stock por categoría:', categorias, cantidades);
    console.log('Datos gráfico valor por estado:', estados, valores);

    // ---- Gráfico de barras: stock por categoría ----
    const ctxStock = this.stockChartRef?.nativeElement.getContext('2d');
    if (ctxStock) {
      const configStock: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: categorias,
          datasets: [
            {
              label: 'Unidades en stock',
              data: cantidades,
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                maxRotation: 45,
                minRotation: 0,
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      };

      this.stockChart = new Chart(ctxStock, configStock);
    } else {
      console.warn('No se encontró el contexto 2D para stockChart');
    }

    // ---- Gráfico doughnut: valor por estado ----
    const ctxEstado = this.estadoChartRef?.nativeElement.getContext('2d');
    if (ctxEstado) {
      const configEstado: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: {
          labels: estados,
          datasets: [
            {
              data: valores,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
        },
      };

      this.estadoChart = new Chart(ctxEstado, configEstado);
    } else {
      console.warn('No se encontró el contexto 2D para estadoChart');
    }
  }

  // Estados para el gráfico de valor por estado
  private obtenerEstado(p: Producto): string {
    const stock = p.stock ?? 0;
    const minimo = (p as any).min ?? 0;
    const activoFlag = p.activo ?? 1;

    if (!activoFlag) {
      return 'Inactivo';
    }
    if (stock === 0) {
      return 'Sin stock';
    }
    if (stock <= minimo) {
      return 'Stock bajo';
    }
    return 'Con stock';
  }

  // ---- Generación de PDF (igual que antes) ----
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

    // Tabla de detalle en el PDF
    const body = this.productos.map((p) => [
      p.nombre,
      p.lote || '',
      p.color || '',
      this.formatoMonedaCLP(p.precio),
      p.stock ?? 0,
      (p as any).min ?? 0,
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
