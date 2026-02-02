import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-document-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="document-history">
      <div class="header-section">
        <h2>📁 Document History</h2>
        <p class="subtitle">View and download all your completed application documents</p>
      </div>

      <div *ngIf="loading" class="spinner"></div>

      <div *ngIf="!loading && completedApplications.length === 0" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
          <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>No Completed Documents</h3>
        <p>You don't have any completed application documents yet.</p>
        <a routerLink="/citizen/apply" class="btn-primary">Apply for Service</a>
      </div>

      <div *ngIf="!loading && completedApplications.length > 0" class="documents-grid">
        <div *ngFor="let app of completedApplications" class="document-card">
          <div class="card-header">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor"/>
                <path d="M14 2V8H20" stroke="white" stroke-width="2"/>
              </svg>
            </div>
            <div class="service-info">
              <h3>{{ app.service?.name }}</h3>
              <span class="app-number">App #{{ app.applicationNumber }}</span>
            </div>
          </div>

          <div class="card-body">
            <div class="info-row">
              <div class="info-item">
                <label>Submitted:</label>
                <span>{{ app.submittedAt | date:'MMM d, y' }}</span>
              </div>
              <div class="info-item">
                <label>Completed:</label>
                <span>{{ app.completedAt | date:'MMM d, y' }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <label>Status:</label>
                <span class="status-badge approved">{{ app.status }}</span>
              </div>
              <div class="info-item">
                <label>Document Upload:</label>
                <span>{{ app.completedDocument?.uploadedAt | date:'MMM d, y' }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button (click)="viewDocument(app)" class="btn-view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              View
            </button>
            <a [href]="environment.baseUrl + '/' + app.completedDocument?.documentPath" 
               download 
               class="btn-download">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>

      <!-- Document Viewer Modal -->
      <div *ngIf="viewingDocument" class="modal-overlay" (click)="closeViewer()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ viewingDocument.service?.name }}</h3>
            <div class="modal-actions">
              <a [href]="environment.baseUrl + '/' + viewingDocument.completedDocument?.documentPath" 
                 download 
                 class="download-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Download
              </a>
              <button class="close-btn" (click)="closeViewer()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="modal-body">
            <iframe 
              *ngIf="getFileType(viewingDocument.completedDocument?.documentPath) === 'pdf'"
              [src]="getSafeUrl(viewingDocument.completedDocument?.documentPath)"
              class="document-viewer"></iframe>
            <img 
              *ngIf="getFileType(viewingDocument.completedDocument?.documentPath) === 'image'"
              [src]="environment.baseUrl + '/' + viewingDocument.completedDocument?.documentPath"
              class="image-viewer"
              alt="Document">
            <div *ngIf="getFileType(viewingDocument.completedDocument?.documentPath) === 'other'" class="unsupported">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>Preview not available for this file type</p>
              <a [href]="environment.baseUrl + '/' + viewingDocument.completedDocument?.documentPath" 
                 download 
                 class="btn-primary">Download to View</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .document-history {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-section {
      margin-bottom: 16px;
    }

    .header-section h2 {
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

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 60px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .empty-state svg {
      color: #d1d5db;
      margin-bottom: 24px;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 12px 0;
    }

    .empty-state p {
      color: #6b7280;
      font-size: 1rem;
      margin: 0 0 24px 0;
    }

    .btn-primary {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 16px;
    }

    .document-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      border: 2px solid #f3f4f6;
    }

    .document-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
      border-color: #6366f1;
    }

    .card-header {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .service-icon {
      width: 48px;
      height: 48px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .service-icon svg {
      color: white;
    }

    .service-info h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: white;
      margin: 0 0 4px 0;
    }

    .app-number {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.8);
      font-family: monospace;
    }

    .card-body {
      padding: 20px;
    }

    .info-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .info-item span {
      color: #1f2937;
      font-weight: 500;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
      display: inline-block;
    }

    .status-badge.approved {
      background: #d1fae5;
      color: #065f46;
    }

    .card-actions {
      padding: 16px 20px;
      border-top: 1px solid #f3f4f6;
      display: flex;
      gap: 12px;
    }

    .btn-view,
    .btn-download {
      flex: 1;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
    }

    .btn-view {
      background: #f3f4f6;
      color: #374151;
      border: 2px solid #e5e7eb;
    }

    .btn-view:hover {
      background: #e5e7eb;
      border-color: #6366f1;
      color: #6366f1;
    }

    .btn-download {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: 2px solid transparent;
    }

    .btn-download:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
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

    .modal-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .download-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.2s;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .download-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
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
      flex-shrink: 0;
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

    @media (max-width: 768px) {
      .documents-grid {
        grid-template-columns: 1fr;
      }

      .info-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .modal-content {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
      }

      .document-viewer,
      .image-viewer {
        height: 60vh;
      }
    }
  `]
})
export class DocumentHistoryComponent implements OnInit {
  environment = environment;
  completedApplications: any[] = [];
  loading = false;
  viewingDocument: any = null;

  constructor(
    private applicationService: ApplicationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadCompletedDocuments();
  }

  loadCompletedDocuments(): void {
    this.loading = true;
    this.applicationService.getMyApplications().subscribe({
      next: (response) => {
        // Filter only completed applications with documents
        this.completedApplications = (response.data || []).filter((app: any) => 
          (app.status === 'Approved' || app.status === 'Completed') && 
          app.completedDocument?.documentPath
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading documents:', err);
        this.loading = false;
      }
    });
  }

  viewDocument(app: any): void {
    this.viewingDocument = app;
  }

  closeViewer(): void {
    this.viewingDocument = null;
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
