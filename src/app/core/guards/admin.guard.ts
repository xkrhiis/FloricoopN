// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // solo deja pasar al rol 'admin'
  if (auth.currentRole() === 'admin') {
    return true;
  }

  // si no es admin, lo mandamos al dashboard
  router.navigateByUrl('/dashboard');
  return false;
};
