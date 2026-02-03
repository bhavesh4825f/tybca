import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Create Account</h2>
        
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              class="form-control" 
              [(ngModel)]="userData.name" 
              name="name" 
              required>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              class="form-control" 
              [(ngModel)]="userData.email" 
              name="email" 
              required>
          </div>

          <div class="form-group">
            <label>Phone</label>
            <input 
              type="tel" 
              class="form-control" 
              [(ngModel)]="userData.phone" 
              name="phone" 
              required>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input 
              type="password" 
              class="form-control" 
              [(ngModel)]="userData.password" 
              name="password" 
              required>
          </div>

          <div class="form-group">
            <label>Aadhar Number</label>
            <input 
              type="text" 
              class="form-control" 
              [(ngModel)]="userData.aadharNumber" 
              name="aadharNumber">
          </div>

          <input type="hidden" [(ngModel)]="userData.role" name="role" value="citizen">

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </form>

        <div class="login-link">
          Already have an account? <a routerLink="/login">Login here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 15px;
    }

    .register-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 500px;
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .btn-block {
      width: 100%;
      margin-top: 10px;
    }

    .login-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
    }

    @media (max-width: 480px) {
      .register-card {
        padding: 25px 20px;
      }

      h2 {
        font-size: 20px;
        margin-bottom: 20px;
      }

      .form-group {
        margin-bottom: 12px;
      }
    }
  `]
})
export class RegisterComponent {
  userData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    aadharNumber: '',
    role: 'citizen'
  };
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.userData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Registration successful! Redirecting...';
          setTimeout(() => {
            const user = response.data?.user || response.user;
            if (user) {
              this.router.navigate([`/${user.role}`]);
            }
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          console.error('Registration error:', error);
          if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check your connection or contact support.';
          } else if (error.status === 400) {
            this.errorMessage = error.error?.message || 'Invalid registration data. Please check your details.';
          } else {
            this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          }
        }
      });
  }
}
