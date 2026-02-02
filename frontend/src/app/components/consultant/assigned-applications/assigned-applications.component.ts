import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';

@Component({
  selector: 'app-assigned-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="assigned-applications">
      <div class="header-section">
        <h2>Assigned Applications</h2>
        <div class="total-count">Total: {{ filteredApplications.length }}</div>
      </div>

      <!-- Search and Filter Section -->
      <div class="filter-section">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM16.5 16.5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchTerm"
            (ngModelChange)="applyFilters()"
            placeholder="Search by application number, citizen name, or service..."
            class="search-input">
          <button *ngIf="searchTerm" (click)="clearSearch()" class="clear-btn">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 8.586L3.707 2.293 2.293 3.707 8.586 10l-6.293 6.293 1.414 1.414L10 11.414l6.293 6.293 1.414-1.414L11.414 10l6.293-6.293-1.414-1.414L10 8.586z"/>
            </svg>
          </button>
        </div>

        <div class="filters">
          <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
            <option value="Pending Documents">Pending Documents</option>
          </select>

          <select [(ngModel)]="sortBy" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="appNumber">Application Number</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="spinner"></div>

      <div *ngIf="!loading && applications.length === 0" class="alert alert-info">
        No applications assigned yet.
      </div>

      <div *ngIf="!loading && applications.length > 0 && filteredApplications.length === 0" class="alert alert-warning">
        No applications match your search criteria.
      </div>

      <div *ngIf="!loading && filteredApplications.length > 0" class="card">
        <table>
          <thead>
            <tr>
              <th>Application No.</th>
              <th>Citizen Name</th>
              <th>Service</th>
              <th>Status</th>
              <th>Submitted Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of filteredApplications">
              <td>{{ app.applicationNumber }}</td>
              <td>{{ app.citizen?.name }}</td>
              <td>{{ app.service?.name }}</td>
              <td>
                <span [ngClass]="getStatusClass(app.status)" class="badge">
                  {{ app.status }}
                </span>
              </td>
              <td>{{ app.submittedAt | date: 'short' }}</td>
              <td>
                <a [routerLink]="['/employee/applications', app._id]" class="btn btn-primary btn-sm" style="margin-right: 5px;">View Details</a>
                <button 
                  class="btn btn-secondary btn-sm" 
                  (click)="openUpdateModal(app)">
                  Update Status
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Update Status Modal -->
      <div *ngIf="selectedApplication" class="modal">
        <div class="modal-content">
          <h3>Update Application Status</h3>
          <p><strong>Application:</strong> {{ selectedApplication.applicationNumber }}</p>
          
          <div class="form-group">
            <label>New Status</label>
            <select class="form-control" [(ngModel)]="newStatus">
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div class="form-group">
            <label>Remarks</label>
            <textarea 
              class="form-control" 
              rows="3" 
              [(ngModel)]="remarks"
              placeholder="Add your remarks..."></textarea>
          </div>

          <div class="modal-actions">
            <button class="btn btn-primary" (click)="updateStatus()">Update</button>
            <button class="btn btn-danger" (click)="closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assigned-applications {
      max-width: 1400px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
    }

    .total-count {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .filter-section {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .search-box {
      position: relative;
      margin-bottom: 16px;
    }

    .search-box svg {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .search-input {
      width: 100%;
      padding: 12px 48px 12px 48px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .clear-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: #f3f4f6;
      border: none;
      padding: 6px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .clear-btn:hover {
      background: #6366f1;
      color: white;
    }

    .clear-btn svg {
      position: static;
      transform: none;
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .filter-select {
      padding: 10px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 0.95rem;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
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
      background: #f9fafb;
    }

    th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #e5e7eb;
    }

    td {
      padding: 16px;
      border-bottom: 1px solid #f3f4f6;
      color: #1f2937;
    }

    tbody tr {
      transition: background 0.2s;
    }

    tbody tr:hover {
      background: #f9fafb;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
      white-space: nowrap;
    }

    .badge-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-danger {
      background: #fee2e2;
      color: #991b1b;
    }

    .alert {
      padding: 16px 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .alert-info {
      background: #dbeafe;
      color: #1e40af;
      border-left: 4px solid #3b82f6;
    }

    .alert-warning {
      background: #fef3c7;
      color: #92400e;
      border-left: 4px solid #f59e0b;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #6366f1;
      color: white;
    }

    .btn-primary:hover {
      background: #4f46e5;
    }

    .btn-secondary {
      background: #64748b;
      color: white;
    }

    .btn-secondary:hover {
      background: #475569;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 40px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
    }

    .modal-content h3 {
      margin-bottom: 20px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .modal-actions button {
      flex: 1;
    }
  `]
})
export class AssignedApplicationsComponent implements OnInit {
  applications: any[] = [];
  filteredApplications: any[] = [];
  loading = false;
  selectedApplication: any = null;
  newStatus = '';
  remarks = '';
  
  // Filter properties
  searchTerm = '';
  statusFilter = '';
  sortBy = 'newest';

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.applicationService.getAssignedApplications()
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
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicationNumber?.toLowerCase().includes(searchLower) ||
        app.citizen?.name?.toLowerCase().includes(searchLower) ||
        app.service?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }

    // Apply sorting
    switch(this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
        break;
      case 'appNumber':
        filtered.sort((a, b) => a.applicationNumber?.localeCompare(b.applicationNumber));
        break;
    }

    this.filteredApplications = filtered;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
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

  openUpdateModal(application: any): void {
    this.selectedApplication = application;
    this.newStatus = application.status;
    this.remarks = '';
  }

  closeModal(): void {
    this.selectedApplication = null;
    this.newStatus = '';
    this.remarks = '';
  }

  updateStatus(): void {
    if (!this.selectedApplication) return;

    this.applicationService.updateApplicationStatus(
      this.selectedApplication._id, 
      this.newStatus
    ).subscribe({
      next: () => {
        if (this.remarks) {
          this.applicationService.addRemark(
            this.selectedApplication._id,
            this.remarks
          ).subscribe();
        }
        alert('Status updated successfully!');
        this.loadApplications();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Failed to update status');
      }
    });
  }
}
