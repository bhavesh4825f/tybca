import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./components/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'employee-login',
    loadComponent: () => import('./components/consultant-login/consultant-login.component').then(m => m.EmployeeLoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'citizen',
    canActivate: [authGuard],
    loadComponent: () => import('./components/citizen/citizen-dashboard/citizen-dashboard.component').then(m => m.CitizenDashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/citizen/citizen-home/citizen-home.component').then(m => m.CitizenHomeComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/citizen/citizen-home/citizen-home.component').then(m => m.CitizenHomeComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./components/citizen/application-list/application-list.component').then(m => m.ApplicationListComponent)
      },
      {
        path: 'apply',
        loadComponent: () => import('./components/citizen/apply-service/apply-service.component').then(m => m.ApplyServiceComponent)
      },
      {
        path: 'applications/:id',
        loadComponent: () => import('./components/shared/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/citizen/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./components/citizen/my-payments/my-payments.component').then(m => m.MyPaymentsComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./components/citizen/document-history/document-history.component').then(m => m.DocumentHistoryComponent)
      }
    ]
  },
  {
    path: 'consultant',
    canActivate: [authGuard],
    loadComponent: () => import('./components/consultant/consultant-dashboard/consultant-dashboard.component').then(m => m.EmployeeDashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/consultant/employee-home/employee-home.component').then(m => m.EmployeeHomeComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./components/consultant/assigned-applications/assigned-applications.component').then(m => m.AssignedApplicationsComponent)
      },
      {
        path: 'applications/:id',
        loadComponent: () => import('./components/shared/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/consultant/profile/profile.component').then(m => m.ConsultantProfileComponent)
      }
    ]
  },
  {
    path: 'employee',
    canActivate: [authGuard],
    loadComponent: () => import('./components/consultant/consultant-dashboard/consultant-dashboard.component').then(m => m.EmployeeDashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/consultant/employee-home/employee-home.component').then(m => m.EmployeeHomeComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./components/consultant/assigned-applications/assigned-applications.component').then(m => m.AssignedApplicationsComponent)
      },
      {
        path: 'applications/:id',
        loadComponent: () => import('./components/shared/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/consultant/profile/profile.component').then(m => m.ConsultantProfileComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/stats/stats.component').then(m => m.StatsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./components/admin/employee-management/employee-management.component').then(m => m.EmployeeManagementComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./components/admin/service-management/service-management.component').then(m => m.ServiceManagementComponent)
      },
      {
        path: 'service-builder',
        loadComponent: () => import('./components/admin/service-builder/service-builder.component').then(m => m.ServiceBuilderComponent)
      },
      {
        path: 'service-builder/:id',
        loadComponent: () => import('./components/admin/service-builder/service-builder.component').then(m => m.ServiceBuilderComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./components/admin/all-applications/all-applications.component').then(m => m.AllApplicationsComponent)
      },
      {
        path: 'applications/:id',
        loadComponent: () => import('./components/shared/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent)
      },
      {
        path: 'contact-queries',
        loadComponent: () => import('./components/admin/contact-queries/contact-queries.component').then(m => m.ContactQueriesComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./components/admin/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
