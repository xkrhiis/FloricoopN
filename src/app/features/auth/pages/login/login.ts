// src/app/features/auth/pages/login/login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // 👈 sin RouterLink
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  show = false;
  form: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  toggle(): void {
    this.show = !this.show;
  }

  invalid(ctrl: 'username' | 'password'): boolean {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.invalid);
  }

  submit(): void {
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.value as {
      username: string;
      password: string;
    };

    const ok = this.auth.login(username, password);

    if (!ok) {
      this.error = 'Usuario o contraseña incorrectos';
    }
  }
}
