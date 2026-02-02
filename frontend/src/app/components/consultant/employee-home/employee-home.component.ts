import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApplicationService } from '../../../services/application.service';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-home">
      <div class="welcome-section">
        <h1>Welcome back, {{ currentUser?.name }}!</h1>
        <p class="subtitle">Here's an overview of your assigned applications</p>
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
            <p>Total Assigned</p>
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
            <p>Under Review</p>
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

      <div class="content-section">
        <div class="recent-applications-card">
          <div class="card-header">
            <h2>Recent Assigned Applications</h2>
            <a routerLink="/employee/applications" class="view-all">View All</a>
          </div>
          <div class="applications-list" *ngIf="recentApplications.length > 0; else noApplications">
            <div *ngFor="let app of recentApplications" class="app-item">
              <div class="app-info">
                <h4>{{ app.service?.name }}</h4>
                <p class="app-citizen">Citizen: {{ app.citizen?.name }}</p>
                <p class="app-id">Application #{{ app.applicationNumber }}</p>
                <p class="app-date">{{ app.submittedAt | date:'MMM d, y' }}</p>
              </div>
              <div class="app-actions">
                <span class="status-badge" [ngClass]="getStatusClass(app.status)">{{ app.status }}</span>
                <a [routerLink]="['/employee/applications', app._id]" class="view-btn">View Details</a>
              </div>
            </div>
          </div>
          <ng-template #noApplications>
            <div class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>No applications assigned yet</p>
            </div>
          </ng-template>
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
      margin-bottom: 32px;
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
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
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
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
    }

    .stat-card.pending .stat-icon {
      background: linear-gradient(135deg, #f59e0b, #f97316);
      color: white;
    }

    .stat-card.approved .stat-icon {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .stat-card.rejected .stat-icon {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 4px 0;
    }

    .stat-content p {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0;
      font-weight: 500;
    }

    .content-section {
      margin-bottom: 32px;
    }

    .recent-applications-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .view-all {
      color: #6366f1;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      transition: color 0.2s;
    }

    .view-all:hover {
      color: #4f46e5;
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
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      transition: all 0.2s;
    }

    .app-item:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .app-info h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 4px 0;
    }

    .app-info p {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 2px 0;
    }

    .app-citizen {
      font-weight: 500;
      color: #4b5563 !important;
    }

    .app-id {
      font-family: monospace;
    }

    .app-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .status-badge.Submitted {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-badge.Under.Review {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.Approved {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.Rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-badge.Completed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.Pending.Documents {
      background: #fef3c7;
      color: #92400e;
    }

    .view-btn {
      padding: 6px 16px;
      background: #6366f1;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .view-btn:hover {
      background: #4f46e5;
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
      font-size: 1rem;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .app-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .app-actions {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
  `]
})
export class EmployeeHomeComponent implements OnInit {
  currentUser: any;
  stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  };
  recentApplications: any[] = [];

  constructor(
    private authService: AuthService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load assigned applications for consultant
    this.applicationService.getAssignedApplications().subscribe({
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
        
        // Get recent 5 applications
        this.recentApplications = applications
          .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .slice(0, 5);
      },
      error: (err) => {
        console.error('Error loading applications:', err);
      }
    });
  }

  getStatusClass(status: string): string {
    return status.replace(/\s+/g, '.');
  }
}
