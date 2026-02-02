import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const userRole = authService.getUserRole();
    const path = state.url.split('/')[1]; // Get first segment after /

    // Role-based route access control
    const roleRouteMap: { [key: string]: string[] } = {
      'citizen': ['citizen'],
      'employee': ['employee', 'consultant'],  // employee can access both employee and consultant routes
      'admin': ['admin']
    };

    // Check if user has access to this route
    if (userRole && roleRouteMap[userRole]) {
      const allowedRoutes = roleRouteMap[userRole];
      if (allowedRoutes.includes(path)) {
        return true;
      }
    }

    // If trying to access a different role's route, redirect to their dashboard
    if (userRole === 'employee') {
      router.navigate(['/employee']);
      return false;
    } else if (userRole === 'citizen') {
      router.navigate(['/citizen']);
      return false;
    } else if (userRole === 'admin') {
      router.navigate(['/admin']);
      return false;
    }

    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
