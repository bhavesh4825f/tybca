import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../services/application.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-all-applications',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="all-applications">
      <div class="page-header">
        <h2>All Applications</h2>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ applications.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Filtered:</span>
            <span class="stat-value">{{ filteredApplications.length }}</span>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by application number, citizen name, or service..." 
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            class="search-input">
          <button *ngIf="searchQuery" (click)="clearSearch()" class="clear-btn">×</button>
        </div>

        <div class="filter-controls">
          <div class="filter-group">
            <label>Status:</label>
            <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="filter-select">
              <option value="">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
              <option value="Pending Documents">Pending Documents</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Assignment:</label>
            <select [(ngModel)]="assignmentFilter" (change)="applyFilters()" class="filter-select">
              <option value="">All</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Sort By:</label>
            <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="applicationNumber">Application Number</option>
            </select>
          </div>

          <button (click)="resetFilters()" class="btn-reset" *ngIf="hasActiveFilters()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 2L2 14M2 2l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Reset Filters
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading applications...</p>
      </div>

      <div *ngIf="!loading && filteredApplications.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="12" width="40" height="40" rx="4" stroke="#e5e7eb" stroke-width="4"/>
          <path d="M24 28h16M24 36h12" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <h3>No applications found</h3>
        <p>{{ applications.length === 0 ? 'No applications have been submitted yet.' : 'Try adjusting your filters.' }}</p>
      </div>

      <div *ngIf="!loading && filteredApplications.length > 0" class="card">
        <table>
          <thead>
            <tr>
              <th>Application No.</th>
              <th>Citizen</th>
              <th>Service</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Submitted Date</th>
              <th style="min-width: 250px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of filteredApplications">
              <td><strong>{{ app.applicationNumber }}</strong></td>
              <td>{{ app.citizen?.name }}</td>
              <td>{{ app.service?.name }}</td>
              <td>
                <span [ngClass]="getStatusClass(app.status)" class="badge">
                  {{ app.status }}
                </span>
              </td>
              <td>{{ app.assignedTo?.name || 'Not Assigned' }}</td>
              <td>{{ app.submittedAt | date: 'short' }}</td>
              <td>
                <div class="action-buttons">
                  <a [routerLink]="['/admin/applications', app._id]" class="btn btn-primary btn-sm">View</a>
                  <button 
                    *ngIf="!app.assignedTo" 
                    class="btn btn-success btn-sm" 
                    (click)="autoAssign(app._id)"
                    [disabled]="assigning === app._id">
                    {{ assigning === app._id ? 'Assigning...' : 'Auto Assign' }}
                  </button>
                  <button 
                    class="btn btn-danger btn-sm" 
                    (click)="deleteApplication(app._id, app.applicationNumber)"
                    [disabled]="deleting === app._id">
                    {{ deleting === app._id ? 'Deleting...' : 'Delete' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .all-applications {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h2 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
    }

    .header-stats {
      display: flex;
      gap: 2rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #dc2626;
    }

    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .search-box {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .search-box svg {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
    }

    .search-input {
      width: 100%;
      padding: 0.875rem 3rem 0.875rem 3rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .clear-btn {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: #e5e7eb;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .clear-btn:hover {
      background: #dc2626;
      color: white;
    }

    .filter-controls {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .filter-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .filter-select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-select:focus {
      outline: none;
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .btn-reset {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-reset:hover {
      background: #dc2626;
      color: white;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #dc2626;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state svg {
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      color: #1e293b;
      margin: 0.5rem 0;
    }

    .empty-state p {
      color: #64748b;
      margin: 0;
    }

    .card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: linear-gradient(135deg, #dc2626, #991b1b);
      color: white;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      color: #475569;
    }

    tbody tr:hover {
      background: #f8fafc;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-info {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .badge-warning {
      background: #fef3c7;
      color: #d97706;
    }

    .badge-success {
      background: #d1fae5;
      color: #059669;
    }

    .badge-danger {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
      margin-right: 0.5rem;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover {
      background: #059669;
    }

    .btn-success:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }

    .btn-danger:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    @media (max-width: 768px) {
      .all-applications {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .filter-controls {
        flex-direction: column;
      }

      .filter-group {
        width: 100%;
      }

      table {
        font-size: 0.875rem;
      }

      th, td {
        padding: 0.75rem 0.5rem;
      }
    }
  `]
})
export class AllApplicationsComponent implements OnInit {
  applications: any[] = [];
  filteredApplications: any[] = [];
  loading = false;
  assigning: string | null = null;
  deleting: string | null = null;
  
  // Filter properties
  searchQuery = '';
  statusFilter = '';
  assignmentFilter = '';
  sortBy = 'newest';

  constructor(
    private applicationService: ApplicationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.applicationService.getAllApplications()
      .subscribe({
        next: (response) => {
          this.applications = response.data;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.applications];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(app => 
        app.applicationNumber?.toLowerCase().includes(query) ||
        app.citizen?.name?.toLowerCase().includes(query) ||
        app.service?.name?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }

    // Apply assignment filter
    if (this.assignmentFilter === 'assigned') {
      filtered = filtered.filter(app => app.assignedTo);
    } else if (this.assignmentFilter === 'unassigned') {
      filtered = filtered.filter(app => !app.assignedTo);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (this.sortBy === 'newest') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      } else if (this.sortBy === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      } else if (this.sortBy === 'applicationNumber') {
        return a.applicationNumber.localeCompare(b.applicationNumber);
      }
      return 0;
    });

    this.filteredApplications = filtered;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.assignmentFilter = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.statusFilter || this.assignmentFilter || this.sortBy !== 'newest');
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'Submitted': 'badge-info',
      'Under Review': 'badge-warning',
      'Approved': 'badge-success',
      'Rejected': 'badge-danger',
      'Completed': 'badge-success',
      'Pending Documents': 'badge-warning'
    };
    return statusMap[status] || 'badge-info';
  }

  autoAssign(applicationId: string): void {
    this.assigning = applicationId;
    this.http.post(`${environment.apiUrl}/admin/applications/${applicationId}/auto-assign`, {}, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          alert('Application assigned successfully!');
          this.assigning = null;
          this.loadApplications(); // Reload to show updated assignment
        },
        error: (error) => {
          console.error('Error auto-assigning:', error);
          alert(error.error?.message || 'Failed to assign application');
          this.assigning = null;
        }
      });
  }

  deleteApplication(applicationId: string, applicationNumber: string): void {
    if (!confirm(`Are you sure you want to delete application ${applicationNumber}? This action cannot be undone.`)) {
      return;
    }

    this.deleting = applicationId;
    this.http.delete(`${environment.apiUrl}/admin/applications/${applicationId}`, { withCredentials: true })
      .subscribe({
        next: () => {
          alert('Application deleted successfully!');
          this.deleting = null;
          this.loadApplications(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting application:', error);
          alert(error.error?.message || 'Failed to delete application');
          this.deleting = null;
        }
      });
  }
}
