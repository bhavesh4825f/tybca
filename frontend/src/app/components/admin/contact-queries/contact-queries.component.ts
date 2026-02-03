import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact-queries',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contact-queries-page">
      <div class="page-header">
        <h1 class="page-title">Contact Queries</h1>
        <p class="page-subtitle">View and manage all contact form submissions</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon new">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 8v13H3V8M1 3h22v5H1V3zm8 7h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">New</div>
            <div class="stat-value">{{ getCountByStatus('new') }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon read">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Read</div>
            <div class="stat-value">{{ getCountByStatus('read') }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon resolved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Resolved</div>
            <div class="stat-value">{{ getCountByStatus('resolved') }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M9 9h6M9 15h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-label">Total</div>
            <div class="stat-value">{{ contacts.length }}</div>
          </div>
        </div>
      </div>

      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          [class.active]="selectedFilter === 'all'"
          (click)="selectedFilter = 'all'">
          All ({{ contacts.length }})
        </button>
        <button 
          class="filter-tab" 
          [class.active]="selectedFilter === 'new'"
          (click)="selectedFilter = 'new'">
          New ({{ getCountByStatus('new') }})
        </button>
        <button 
          class="filter-tab" 
          [class.active]="selectedFilter === 'read'"
          (click)="selectedFilter = 'read'">
          Read ({{ getCountByStatus('read') }})
        </button>
        <button 
          class="filter-tab" 
          [class.active]="selectedFilter === 'resolved'"
          (click)="selectedFilter = 'resolved'">
          Resolved ({{ getCountByStatus('resolved') }})
        </button>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading contact queries...</p>
      </div>

      <div *ngIf="!loading && filteredContacts.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="#e5e7eb" stroke-width="4"/>
          <path d="M32 20v16M32 44v.5" stroke="#9ca3af" stroke-width="4" stroke-linecap="round"/>
        </svg>
        <h3>No contact queries found</h3>
        <p>{{ selectedFilter === 'all' ? 'No queries have been submitted yet.' : 'No ' + selectedFilter + ' queries found.' }}</p>
      </div>

      <div class="contacts-grid" *ngIf="!loading && filteredContacts.length > 0">
        <div class="contact-card" *ngFor="let contact of filteredContacts">
          <div class="contact-header">
            <div class="contact-info">
              <div class="contact-name">{{ contact.name }}</div>
              <div class="contact-date">{{ formatDate(contact.createdAt) }}</div>
            </div>
            <div class="status-badge" [class]="contact.status">
              {{ contact.status }}
            </div>
          </div>

          <div class="contact-details">
            <div class="detail-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4l6 4 6-4M2 4v8a1 1 0 001 1h10a1 1 0 001-1V4M2 4a1 1 0 011-1h10a1 1 0 011 1" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span>{{ contact.email }}</span>
            </div>
            <div class="detail-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 3h12M5 7h6M7 11h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>{{ contact.phone }}</span>
            </div>
          </div>

          <div class="contact-message">
            <strong>Message:</strong>
            <p>{{ contact.message }}</p>
          </div>

          <div class="contact-actions">
            <button 
              class="btn-action mark-read" 
              *ngIf="contact.status === 'new'"
              (click)="updateStatus(contact._id, 'read')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Mark as Read
            </button>
            <button 
              class="btn-action mark-resolved" 
              *ngIf="contact.status !== 'resolved'"
              (click)="updateStatus(contact._id, 'resolved')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Resolve
            </button>
            <button 
              class="btn-action delete" 
              (click)="deleteContact(contact._id)">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-queries-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
    }

    .page-subtitle {
      color: #64748b;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

    .stat-icon.new {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
    }

    .stat-icon.read {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }

    .stat-icon.resolved {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .stat-icon.total {
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: white;
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1e293b;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-tab {
      padding: 0.75rem 1.5rem;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 8px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-tab:hover {
      border-color: #dc2626;
      color: #dc2626;
    }

    .filter-tab.active {
      background: linear-gradient(135deg, #dc2626, #991b1b);
      color: white;
      border-color: #dc2626;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #64748b;
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

    .contacts-grid {
      display: grid;
      gap: 1.5rem;
    }

    .contact-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }

    .contact-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .contact-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .contact-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1e293b;
    }

    .contact-date {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    .status-badge {
      padding: 0.375rem 0.875rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.new {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .status-badge.read {
      background: #fef3c7;
      color: #d97706;
    }

    .status-badge.resolved {
      background: #d1fae5;
      color: #059669;
    }

    .contact-details {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.875rem;
    }

    .detail-item svg {
      flex-shrink: 0;
    }

    .contact-message {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .contact-message strong {
      color: #1e293b;
      display: block;
      margin-bottom: 0.5rem;
    }

    .contact-message p {
      color: #475569;
      margin: 0;
      line-height: 1.6;
    }

    .contact-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-action svg {
      width: 16px;
      height: 16px;
    }

    .btn-action.mark-read {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .btn-action.mark-read:hover {
      background: #1d4ed8;
      color: white;
    }

    .btn-action.mark-resolved {
      background: #d1fae5;
      color: #059669;
    }

    .btn-action.mark-resolved:hover {
      background: #059669;
      color: white;
    }

    .btn-action.delete {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-action.delete:hover {
      background: #dc2626;
      color: white;
    }

    @media (max-width: 768px) {
      .contact-queries-page {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .contact-details {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class ContactQueriesComponent implements OnInit {
  contacts: any[] = [];
  filteredContacts: any[] = [];
  loading = true;
  selectedFilter = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading = true;
    const token = localStorage.getItem('token');
    
    this.http.get(`${environment.apiUrl}/contact/queries`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        this.contacts = response;
        this.filterContacts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.loading = false;
      }
    });
  }

  filterContacts(): void {
    if (this.selectedFilter === 'all') {
      this.filteredContacts = this.contacts;
    } else {
      this.filteredContacts = this.contacts.filter(c => c.status === this.selectedFilter);
    }
  }

  ngOnChanges(): void {
    this.filterContacts();
  }

  getCountByStatus(status: string): number {
    return this.contacts.filter(c => c.status === status).length;
  }

  updateStatus(id: string, status: string): void {
    const token = localStorage.getItem('token');
    
    this.http.put(`${environment.apiUrl}/contact/queries/${id}/status`, 
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadContacts();
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Failed to update status');
      }
    });
  }

  deleteContact(id: string): void {
    if (!confirm('Are you sure you want to delete this contact query?')) {
      return;
    }

    const token = localStorage.getItem('token');
    
    this.http.delete(`${environment.apiUrl}/contact/queries/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.loadContacts();
      },
      error: (error) => {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact query');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }
}
