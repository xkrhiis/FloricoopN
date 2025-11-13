import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuarios, Usuario } from '../../../../core/services/usuarios';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-lista.html',
  styleUrls: ['./usuarios-lista.scss'],
})
export class UsuariosListaComponent implements OnInit {
  usuarios: Usuario[] = [];
  constructor(private svc: Usuarios) {}

  ngOnInit(): void {
    this.usuarios = this.svc.all();
  }
}