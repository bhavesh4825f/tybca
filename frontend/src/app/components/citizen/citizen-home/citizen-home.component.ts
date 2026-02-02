import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApplicationService } from '../../../services/application.service';
import { ServiceService } from '../../../services/service.service';

@Component({
  selector: 'app-citizen-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-home">
      <div class="welcome-section">
        <h1>Welcome back, {{ currentUser?.name }}!</h1>
        <p class="subtitle">Here's what's happening with your applications</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.total }}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.pending }}</h3>
            <p>Pending Review</p>
          </div>
        </div>

        <div class="stat-card approved">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.approved }}</h3>
            <p>Approved</p>
          </div>
        </div>

        <div class="stat-card rejected">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats.rejected }}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="quick-actions-card">
          <h2>Quick Actions</h2>
          <div class="actions-list">
            <a routerLink="/citizen/apply" class="action-btn primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
              </svg>
              <div>
                <h4>Apply for New Service</h4>
                <p>Start a new application</p>
              </div>
            </a>
            <a routerLink="/citizen/applications" class="action-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
              </svg>
              <div>
                <h4>View My Applications</h4>
                <p>Track application status</p>
              </div>
            </a>
            <a routerLink="/citizen/profile" class="action-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
              </svg>
              <div>
                <h4>Update Profile</h4>
                <p>Manage your information</p>
              </div>
            </a>
          </div>
        </div>

        <div class="recent-applications-card">
          <div class="card-header">
            <h2>Recent Applications</h2>
            <a routerLink="/citizen/applications" class="view-all">View All</a>
          </div>
          <div class="applications-list" *ngIf="recentApplications.length > 0; else noApplications">
            <div *ngFor="let app of recentApplications" class="app-item">
              <div class="app-info">
                <h4>{{ app.serviceName }}</h4>
                <p class="app-id">Application #{{ app._id.slice(-6) }}</p>
                <p class="app-date">{{ app.submittedDate | date:'MMM d, y' }}</p>
              </div>
              <span class="status-badge" [class]="app.status">{{ app.status }}</span>
            </div>
          </div>
          <ng-template #noApplications>
            <div class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>No applications yet</p>
              <a routerLink="/citizen/apply" class="btn-primary">Apply for a Service</a>
            </div>
          </ng-template>
        </div>
      </div>

      <div class="services-section">
        <div class="section-header">
          <h2>Available Services</h2>
          <a routerLink="/citizen/apply" class="view-all">View All</a>
        </div>
        <div class="services-grid" *ngIf="availableServices.length > 0">
          <div *ngFor="let service of availableServices.slice(0, 6)" class="service-card">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 6H12L10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6Z" fill="currentColor"/>
              </svg>
            </div>
            <h3>{{ service.name }}</h3>
            <p>{{ service.description }}</p>
            <a [routerLink]="['/citizen/apply']" [queryParams]="{service: service._id}" class="apply-link">
              Apply Now →
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-home {
      max-width: 1400px;
      margin: 0 auto;
    }

    .welcome-section {
      margin-bottom: 20px;
    }

    .welcome-section h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .subtitle {
      color: #6b7280;
      font-size: 1rem;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-card.total .stat-icon {
      background: #dbeafe;
      color: #1e40af;
    }

    .stat-card.pending .stat-icon {
      background: #fef3c7;
      color: #d97706;
    }

    .stat-card.approved .stat-icon {
      background: #d1fae5;
      color: #059669;
    }

    .stat-card.rejected .stat-icon {
      background: #fee2e2;
      color: #dc2626;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: #1f2937;
    }

    .stat-content p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .quick-actions-card,
    .recent-applications-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .quick-actions-card h2,
    .recent-applications-card h2 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 20px 0;
      color: #1f2937;
    }

    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      text-decoration: none;
      transition: all 0.2s;
      background: white;
    }

    .action-btn:hover {
      border-color: #6366f1;
      background: #f9fafb;
      transform: translateX(4px);
    }

    .action-btn.primary {
      background: #6366f1;
      border-color: #6366f1;
      color: white;
    }

    .action-btn.primary:hover {
      background: #4f46e5;
    }

    .action-btn svg {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      color: #6366f1;
    }

    .action-btn.primary svg {
      color: white;
    }

    .action-btn h4 {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .action-btn.primary h4 {
      color: white;
    }

    .action-btn p {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .action-btn.primary p {
      color: rgba(255,255,255,0.9);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .view-all {
      color: #6366f1;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .applications-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .app-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
    }

    .app-info h4 {
      margin: 0 0 4px 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #1f2937;
    }

    .app-id,
    .app-date {
      margin: 0;
      font-size: 0.8rem;
      color: #6b7280;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #d97706;
    }

    .status-badge.approved {
      background: #d1fae5;
      color: #059669;
    }

    .status-badge.rejected {
      background: #fee2e2;
      color: #dc2626;
    }

    .status-badge.under-review {
      background: #dbeafe;
      color: #1e40af;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-state svg {
      color: #d1d5db;
      margin-bottom: 16px;
    }

    .empty-state p {
      color: #6b7280;
      margin: 0 0 16px 0;
    }

    .btn-primary {
      display: inline-block;
      padding: 10px 20px;
      background: #6366f1;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }

    .btn-primary:hover {
      background: #4f46e5;
    }

    .services-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      color: #1f2937;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .service-card {
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      transition: all 0.2s;
    }

    .service-card:hover {
      border-color: #6366f1;
      box-shadow: 0 4px 12px rgba(99,102,241,0.1);
    }

    .service-icon {
      width: 48px;
      height: 48px;
      background: #dbeafe;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1e40af;
      margin-bottom: 12px;
    }

    .service-card h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #1f2937;
    }

    .service-card p {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 12px 0;
      line-height: 1.5;
    }

    .apply-link {
      color: #6366f1;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .apply-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .services-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CitizenHomeComponent implements OnInit {
  currentUser: any;
  stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  };
  recentApplications: any[] = [];
  availableServices: any[] = [];

  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load applications
    this.applicationService.getMyApplications().subscribe({
      next: (response) => {
        const applications = response.data || [];
        this.stats.total = applications.length;
        this.stats.pending = applications.filter((app: any) => 
          app.status === 'Submitted' || app.status === 'Under Review' || app.status === 'Pending Documents'
        ).length;
        this.stats.approved = applications.filter((app: any) => 
          app.status === 'Approved' || app.status === 'Completed'
        ).length;
        this.stats.rejected = applications.filter((app: any) => app.status === 'Rejected').length;
        
        // Get recent 3 applications
        this.recentApplications = applications
          .sort((a: any, b: any) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
          .slice(0, 3);
      },
      error: (err) => {
        console.error('Error loading applications:', err);
      }
    });

    // Load services
    this.serviceService.getAllServices().subscribe({
      next: (response) => {
        this.availableServices = response.data || [];
      },
      error: (err) => {
        console.error('Error loading services:', err);
      }
    });
  }
}
