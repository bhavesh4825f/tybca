import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../services/application.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="application-list">
      <div class="page-header">
        <h2>My Applications</h2>
        <div class="stats-badge">
          <span class="stat-label">Total:</span>
          <span class="stat-value">{{ applications.length }}</span>
          <span class="stat-divider">|</span>
          <span class="stat-label">Showing:</span>
          <span class="stat-value">{{ filteredApplications.length }}</span>
        </div>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by application number or service name..." 
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            class="search-input">
          <button *ngIf="searchQuery" (click)="clearSearch()" class="clear-btn">×</button>
        </div>

        <div class="filter-row">
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="filter-select">
            <option value="">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
            <option value="Pending Documents">Pending Documents</option>
          </select>

          <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="applicationNumber">Application Number</option>
          </select>

          <button (click)="resetFilters()" class="btn-reset" *ngIf="hasActiveFilters()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 2L2 14M2 2l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Reset
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your applications...</p>
      </div>

      <div *ngIf="!loading && filteredApplications.length === 0" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect x="16" y="16" width="48" height="48" rx="4" stroke="#e5e7eb" stroke-width="4"/>
          <path d="M28 32h24M28 44h18" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <h3>{{ applications.length === 0 ? 'No applications yet' : 'No matching applications' }}</h3>
        <p>{{ applications.length === 0 ? 'Start by applying for a service.' : 'Try adjusting your filters.' }}</p>
        <a *ngIf="applications.length === 0" routerLink="/citizen/apply" class="btn btn-primary">Apply for Service</a>
      </div>

      <div *ngIf="!loading && filteredApplications.length > 0" class="applications-grid">
        <div class="application-card" *ngFor="let app of filteredApplications">
          <div class="card-header">
            <div class="app-info">
              <div class="app-number">{{ app.applicationNumber }}</div>
              <div class="service-name">{{ app.service?.name }}</div>
            </div>
            <span [ngClass]="getStatusClass(app.status)" class="status-badge">
              {{ app.status }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 14A6 6 0 108 2a6 6 0 000 12z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 4v4l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="info-label">Submitted:</span>
              <span class="info-value">{{ app.submittedAt | date: 'medium' }}</span>
            </div>
            
            <div class="info-row" *ngIf="app.assignedTo">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM3 14a5 5 0 0110 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="info-label">Assigned to:</span>
              <span class="info-value">{{ app.assignedTo?.name }}</span>
            </div>

            <div class="info-row" *ngIf="app.documents && app.documents.length > 0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6l-4-4z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M9 2v4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="info-label">Submitted Documents:</span>
              <span class="info-value">{{ getDocumentStatus(app.documents) }}</span>
            </div>

            <div class="alert-edit" *ngIf="app.editingEnabled">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Editing Enabled - Action Required</span>
            </div>
          </div>

          <div class="card-footer">
            <a [routerLink]="['/citizen/applications', app._id]" class="btn-view">
              View Details
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </a>
            
            <button *ngIf="app.documents && hasUploadedDocuments(app.documents)" 
                    (click)="viewSubmittedDocuments(app)"
                    class="btn-documents">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6l-4-4z" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              Submitted Docs
            </button>
          </div>
        </div>
      </div>

      <!-- Document Viewer Modal -->
      <div *ngIf="viewingDocuments" class="modal-overlay" (click)="closeViewer()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ viewingDocuments.title }}</h3>
            <button class="close-btn" (click)="closeViewer()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div *ngIf="viewingDocuments.type === 'submitted'" class="documents-list">
              <div *ngFor="let doc of viewingDocuments.documents" class="doc-item">
                <div class="doc-info">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#6366f1"/>
                    <path d="M14 2V8H20" stroke="white" stroke-width="2"/>
                  </svg>
                  <div>
                    <h4>{{ doc.documentType }}</h4>
                    <p *ngIf="doc.uploadedAt">Uploaded: {{ doc.uploadedAt | date:'medium' }}</p>
                  </div>
                </div>
                <div class="doc-actions">
                  <button (click)="openDocumentInViewer(doc.documentPath)" class="btn-action">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    View
                  </button>
                  <a [href]="environment.baseUrl + '/' + doc.documentPath" download class="btn-action">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>

            <div *ngIf="viewingDocuments.type === 'completed'" class="document-viewer-container">
              <div class="viewer-actions">
                <a [href]="environment.baseUrl + '/' + viewingDocuments.documentPath" 
                   download 
                   class="btn-download-large">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Download Document
                </a>
              </div>
              <iframe 
                *ngIf="getFileType(viewingDocuments.documentPath) === 'pdf'"
                [src]="getSafeUrl(viewingDocuments.documentPath)"
                class="document-viewer"></iframe>
              <img 
                *ngIf="getFileType(viewingDocuments.documentPath) === 'image'"
                [src]="environment.baseUrl + '/' + viewingDocuments.documentPath"
                class="image-viewer"
                alt="Document">
              <div *ngIf="getFileType(viewingDocuments.documentPath) === 'other'" class="unsupported">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <p>Preview not available for this file type</p>
                <a [href]="environment.baseUrl + '/' + viewingDocuments.documentPath" 
                   download 
                   class="btn-primary">Download to View</a>
              </div>
            </div>

            <div *ngIf="currentViewingDocument" class="single-document-viewer">
              <iframe 
                *ngIf="getFileType(currentViewingDocument) === 'pdf'"
                [src]="getSafeUrl(currentViewingDocument)"
                class="document-viewer"></iframe>
              <img 
                *ngIf="getFileType(currentViewingDocument) === 'image'"
                [src]="environment.baseUrl + '/' + currentViewingDocument"
                class="image-viewer"
                alt="Document">
              <div *ngIf="getFileType(currentViewingDocument) === 'other'" class="unsupported">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <p>Preview not available</p>
                <button (click)="currentViewingDocument = null" class="btn-back-docs">Back to List</button>
              </div>
              <button *ngIf="currentViewingDocument" (click)="currentViewingDocument = null" class="btn-back-float">
                ← Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .application-list {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .stats-badge {
      background: linear-gradient(135deg, #059669, #047857);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }

    .stat-label {
      opacity: 0.9;
    }

    .stat-value {
      font-weight: 700;
      font-size: 1.125rem;
      margin: 0 0.25rem;
    }

    .stat-divider {
      opacity: 0.5;
      margin: 0 0.75rem;
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
      margin-bottom: 1rem;
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
      padding: 0.875rem 3rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #059669;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
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
      background: #059669;
      color: white;
    }

    .filter-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-select {
      flex: 1;
      min-width: 200px;
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
      border-color: #059669;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
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
      border-top-color: #059669;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state svg {
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #1e293b;
      margin: 0.5rem 0;
    }

    .empty-state p {
      color: #64748b;
      margin: 0.5rem 0 1.5rem 0;
    }

    .applications-grid {
      display: grid;
      gap: 1rem;
    }

    .application-card {
      background: white;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }

    .application-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .app-number {
      font-size: 1rem;
      font-weight: 700;
      color: #059669;
      margin-bottom: 0.25rem;
    }

    .service-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .status-badge {
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

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .info-row svg {
      color: #64748b;
      flex-shrink: 0;
    }

    .info-label {
      color: #64748b;
    }

    .info-value {
      color: #1e293b;
      font-weight: 600;
    }

    .info-value.completed {
      color: #059669;
      font-weight: 700;
    }

    .alert-edit {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #fef3c7;
      border-left: 3px solid #f59e0b;
      border-radius: 6px;
      color: #92400e;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .alert-edit svg {
      color: #f59e0b;
      flex-shrink: 0;
    }

    .card-footer {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .btn-view {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #059669, #047857);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-view:hover {
      background: linear-gradient(135deg, #047857, #065f46);
      transform: translateX(4px);
    }

    .btn-view svg {
      transition: transform 0.2s;
    }

    .btn-view:hover svg {
      transform: translateX(2px);
    }

    .btn-edit {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-edit:hover {
      background: linear-gradient(135deg, #d97706, #b45309);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .btn-edit svg {
      flex-shrink: 0;
    }

    .btn-documents, .btn-completed {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 2px solid #6366f1;
      background: white;
      color: #6366f1;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-documents:hover, .btn-completed:hover {
      background: #6366f1;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .btn-completed {
      border-color: #10b981;
      color: #10b981;
    }

    .btn-completed:hover {
      background: #10b981;
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #059669;
      color: white;
    }

    .btn-primary:hover {
      background: #047857;
    }

    @media (max-width: 768px) {
      .application-list {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .filter-row {
        flex-direction: column;
      }

      .filter-select {
        width: 100%;
      }

      .card-footer {
        flex-wrap: wrap;
      }

      .btn-documents, .btn-completed {
        flex: 1;
        min-width: 120px;
      }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 1200px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .modal-body {
      flex: 1;
      overflow: auto;
      padding: 20px;
      background: #f9fafb;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .doc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .doc-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .doc-info h4 {
      margin: 0 0 4px 0;
      color: #1f2937;
      font-size: 1rem;
      font-weight: 600;
    }

    .doc-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .doc-actions {
      display: flex;
      gap: 12px;
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: 2px solid #6366f1;
      background: white;
      color: #6366f1;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: #6366f1;
      color: white;
    }

    .document-viewer-container, .single-document-viewer {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .viewer-actions {
      display: flex;
      justify-content: center;
      padding: 12px;
      background: white;
      border-radius: 8px;
    }

    .btn-download-large {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-download-large:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
    }

    .document-viewer {
      width: 100%;
      height: 70vh;
      border: none;
      border-radius: 8px;
      background: white;
    }

    .image-viewer {
      width: 100%;
      height: auto;
      max-height: 70vh;
      object-fit: contain;
      border-radius: 8px;
      background: white;
    }

    .unsupported {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      background: white;
      border-radius: 8px;
    }

    .unsupported svg {
      color: #d1d5db;
      margin-bottom: 20px;
    }

    .unsupported p {
      color: #6b7280;
      font-size: 1.125rem;
      margin: 0 0 20px 0;
    }

    .btn-back-docs, .btn-back-float {
      padding: 10px 20px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-back-docs:hover, .btn-back-float:hover {
      background: #4f46e5;
    }

    .btn-back-float {
      position: sticky;
      top: 20px;
      align-self: flex-start;
      margin-bottom: 16px;
    }
  `]
})
export class ApplicationListComponent implements OnInit {
  environment = environment;
  applications: any[] = [];
  filteredApplications: any[] = [];
  loading = false;
  
  // Filter properties
  searchQuery = '';
  statusFilter = '';
  sortBy = 'newest';

  // Document viewer properties
  viewingDocuments: any = null;
  currentViewingDocument: string | null = null;

  constructor(
    private applicationService: ApplicationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.applicationService.getMyApplications()
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
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicationNumber?.toLowerCase().includes(query) ||
        app.service?.name?.toLowerCase().includes(query) ||
        app.service?.category?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(app => 
        app.status === this.statusFilter
      );
    }

    // Apply sorting
    if (this.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } else if (this.sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    } else if (this.sortBy === 'applicationNumber') {
      filtered.sort((a, b) => (a.applicationNumber || '').localeCompare(b.applicationNumber || ''));
    }

    this.filteredApplications = filtered;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchQuery !== '' || this.statusFilter !== '' || this.sortBy !== 'newest';
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

  getDocumentStatus(documents: any[]): string {
    if (!documents || documents.length === 0) {
      return 'None required';
    }
    const uploaded = documents.filter(doc => doc.documentPath).length;
    const total = documents.length;
    return `${uploaded}/${total} uploaded`;
  }

  hasUploadedDocuments(documents: any[]): boolean {
    return documents && documents.some(doc => doc.documentPath);
  }

  viewSubmittedDocuments(app: any): void {
    const uploadedDocs = app.documents.filter((doc: any) => doc.documentPath);
    this.viewingDocuments = {
      type: 'submitted',
      title: `Submitted Documents - ${app.service?.name}`,
      documents: uploadedDocs
    };
  }

  viewCompletedDocument(app: any): void {
    this.viewingDocuments = {
      type: 'completed',
      title: `Completed Document - ${app.service?.name}`,
      documentPath: app.completedDocument.documentPath
    };
  }

  openDocumentInViewer(path: string): void {
    this.currentViewingDocument = path;
  }

  closeViewer(): void {
    this.viewingDocuments = null;
    this.currentViewingDocument = null;
  }

  getFileType(path: string): 'pdf' | 'image' | 'other' {
    if (!path) return 'other';
    const ext = path.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    return 'other';
  }

  getSafeUrl(path: string): SafeResourceUrl {
    const url = `${environment.baseUrl}/${path}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
