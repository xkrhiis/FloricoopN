import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InventarioService } from '../../../../core/services/inventario';

type Producto = { id?: number; nombre: string; stock: number; min?: number };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  private inv = inject(InventarioService);
  private router = inject(Router);

  productos = signal<Producto[]>([]);
  umbral = 5;

  skus = computed(() => this.productos().length);
  total = computed(() => this.productos().reduce((a, p) => a + (p.stock ?? 0), 0));
  lowList = computed(() =>
    this.productos().filter(p => (p.stock ?? 0) <= (p.min ?? this.umbral))
  );
  lowCount = computed(() => this.lowList().length);

  now = signal(new Date());
  time = computed(() =>
    this.now().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.productos.set(this.inv.all());
    this.now.set(new Date());
  }

  goLow() {
    this.router.navigate(['/inventario'], { queryParams: { filter: 'low' } });
  }

  newProduct() {
    this.router.navigate(['/inventario'], { queryParams: { action: 'new' } });
  }

  nuevoProducto() {
    this.newProduct();
  }
}