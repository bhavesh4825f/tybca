import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Admin Login</h2>
          <p>Access Administrative Panel</p>
        </div>
        
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              class="form-control" 
              [(ngModel)]="credentials.email" 
              name="email" 
              required
              placeholder="Enter admin email">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input 
              type="password" 
              class="form-control" 
              [(ngModel)]="credentials.password" 
              name="password" 
              required
              placeholder="Enter password">
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? 'Logging in...' : 'Login as Admin' }}
          </button>
        </form>

        <div class="other-logins">
          <p>Other Login Options:</p>
          <a routerLink="/login" class="link-button">Citizen Login</a>
          <a routerLink="/employee-login" class="link-button">Employee Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 450px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h2 {
      color: #dc3545;
      margin-bottom: 10px;
    }

    .login-header p {
      color: #666;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 600;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .form-control:focus {
      outline: none;
      border-color: #dc3545;
    }

    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #dc3545;
      color: white;
    }

    .btn-primary:hover {
      background: #c82333;
    }

    .btn-block {
      width: 100%;
      margin-top: 10px;
    }

    .btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .alert {
      padding: 12px;
      border-radius: 5px;
      margin-bottom: 20px;
    }

    .alert-danger {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .other-logins {
      margin-top: 30px;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .other-logins p {
      color: #666;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .link-button {
      display: block;
      margin: 10px 0;
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s;
    }

    .link-button:hover {
      color: #764ba2;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 25px 20px;
      }

      .login-header h2 {
        font-size: 20px;
      }

      .login-header p {
        font-size: 13px;
      }

      .form-control {
        padding: 10px;
        font-size: 14px;
      }

      .btn {
        padding: 10px 16px;
        font-size: 15px;
      }
    }
  `]
})
export class AdminLoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        const user = response.data?.user || response.user;
        if (user) {
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (user.role === 'citizen') {
            this.errorMessage = 'Access denied. Citizens must use Citizen Login page.';
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else if (user.role === 'employee') {
            this.errorMessage = 'Access denied. Employees must use Employee Login page.';
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else {
            this.errorMessage = 'Access denied. Admin credentials required.';
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check your connection or contact support.';
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid credentials. Please check your email and password.';
        } else if (error.status === 403) {
          this.errorMessage = 'Account is inactive. Please contact administrator.';
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Please try again later.';
        }
        this.loading = false;
      }
    });
  }
}
