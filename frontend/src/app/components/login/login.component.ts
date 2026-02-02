import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Digital Government Service Consultancy</h2>
        <h3>Login</h3>
        
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
              required>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input 
              type="password" 
              class="form-control" 
              [(ngModel)]="credentials.password" 
              name="password" 
              required>
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="register-link">
          Don't have an account? <a routerLink="/register">Register here</a>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      color: #667eea;
      text-align: center;
      margin-bottom: 10px;
      font-size: 20px;
    }

    h3 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .btn-block {
      width: 100%;
      margin-top: 10px;
    }

    .register-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
    }
  `]
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage = '';
  loading = false;
  returnUrl: string = '/citizen';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/citizen';
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials)
      .subscribe({
        next: (response) => {
          this.loading = false;
          const user = response.data?.user || response.user;
          if (user) {
            // Check if admin or employee trying to login
            if (user.role === 'admin') {
              this.errorMessage = 'Admins must login through Admin Login page';
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              return;
            }
            if (user.role === 'employee') {
              this.errorMessage = 'Employees must login through Employee Login page';
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              return;
            }
            // Only allow citizens
            if (user.role === 'citizen') {
              this.router.navigateByUrl(this.returnUrl);
            }
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
  }
}
