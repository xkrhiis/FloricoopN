// src/app/features/historial-inventario/historial-inventario.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import {
  RegistrosService,
  RegistroInventario,
} from '../../core/services/registros.service';

@Component({
  selector: 'app-historial-inventario',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './historial-inventario.component.html',
  styleUrls: ['./historial-inventario.component.scss'],
})
export class HistorialInventarioComponent implements OnInit {
  registros: RegistroInventario[] = [];
  cargando = false;
  error: string | null = null;

  /** Fecha/hora de generación del reporte (para el PDF) */
  generadoEn = new Date();

  constructor(private registrosService: RegistrosService) {}

  ngOnInit(): void {
    this.cargarRegistros();
  }

  cargarRegistros(): void {
    this.cargando = true;
    this.error = null;

    this.registrosService.list().subscribe({
      next: (data) => {
        this.registros = data;
        this.cargando = false;
        this.generadoEn = new Date();
      },
      error: (err) => {
        console.error('Error al cargar historial', err);
        this.error = 'No se pudo cargar el historial de inventario.';
        this.cargando = false;
      },
    });
  }

  /** Valor total por fila */
  valorTotal(r: RegistroInventario): number {
    return r.precio_unitario * r.cantidad;
  }

  /** Métricas para el resumen del PDF */
  get totalRegistros(): number {
    return this.registros.length;
  }

  get unidadesTotales(): number {
    return this.registros.reduce((acc, r) => acc + r.cantidad, 0);
  }

  get valorTotalEstimado(): number {
    return this.registros.reduce(
      (acc, r) => acc + r.precio_unitario * r.cantidad,
      0
    );
  }

  get precioUnitarioPromedio(): number {
    if (!this.registros.length) return 0;
    return this.valorTotalEstimado / this.registros.length;
  }

  /** Abre el diálogo de impresión (el usuario elige "Guardar como PDF") */
  descargarPDF(): void {
    window.print();
  }
}
