import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  show = false;
  form: FormGroup;                 // <-- declarada
  error: string | null = null;     // <-- ahora existe

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // <-- inicializamos dentro del constructor (evita TS2729)
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
    const { username, password } = this.form.value;
    const ok = this.auth.login(username, password);
    if (ok) {
      this.router.navigateByUrl('/dashboard');
    } else {
      this.error = 'Usuario o contraseña incorrectos';
    }
  }
}