import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-payments-page">
      <div class="page-header">
        <h2>My Payment History</h2>
        <div class="total-spent">
          <span class="label">Total Spent:</span>
          <span class="amount">₹{{ getTotalSpent() }}</span>
        </div>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by transaction ID or service name..." 
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            class="search-input">
          <button *ngIf="searchQuery" (click)="clearSearch()" class="clear-btn">×</button>
        </div>

        <div class="filter-row">
          <select [(ngModel)]="methodFilter" (change)="applyFilters()" class="filter-select">
            <option value="">All Payment Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cash">Cash</option>
          </select>

          <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high">Amount (High to Low)</option>
            <option value="amount-low">Amount (Low to High)</option>
          </select>

          <button (click)="resetFilters()" class="btn-reset" *ngIf="hasActiveFilters()">
            Reset Filters
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your payment history...</p>
      </div>

      <div *ngIf="!loading && filteredTransactions.length === 0" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" stroke="#e5e7eb" stroke-width="4"/>
          <path d="M40 24v20M32 56h16" stroke="#9ca3af" stroke-width="4" stroke-linecap="round"/>
        </svg>
        <h3>No payment history</h3>
        <p>{{ transactions.length === 0 ? 'You haven\'t made any payments yet.' : 'No transactions match your filters.' }}</p>
      </div>

      <div *ngIf="!loading && filteredTransactions.length > 0" class="transactions-grid">
        <div class="transaction-card" *ngFor="let txn of filteredTransactions">
          <div class="card-header">
            <div class="service-info">
              <div class="service-name">{{ txn.serviceName }}</div>
              <div class="app-number">{{ txn.applicationNumber }}</div>
            </div>
            <div class="amount-display">₹{{ txn.amount }}</div>
          </div>

          <div class="card-details">
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">{{ txn.transactionId }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="method-badge" [class]="getMethodClass(txn.paymentMethod)">
                {{ txn.paymentMethod }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Date:</span>
              <span class="detail-value">{{ formatDate(txn.paidAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="status-badge">{{ txn.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && filteredTransactions.length > 0" class="summary-section">
        <div class="summary-card">
          <h3>Payment Summary</h3>
          <div class="summary-stats">
            <div class="summary-item">
              <div class="summary-label">Total Transactions</div>
              <div class="summary-value">{{ filteredTransactions.length }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Amount</div>
              <div class="summary-value">₹{{ getTotalSpent() }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Average Payment</div>
              <div class="summary-value">₹{{ getAveragePayment() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-payments-page {
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

    .total-spent {
      background: linear-gradient(135deg, #059669, #047857);
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }

    .total-spent .label {
      font-size: 0.875rem;
      opacity: 0.9;
      display: block;
      margin-bottom: 0.25rem;
    }

    .total-spent .amount {
      font-size: 1.75rem;
      font-weight: 700;
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
      padding: 0.75rem 1.5rem;
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
      margin: 0;
    }

    .transactions-grid {
      display: grid;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .transaction-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }

    .transaction-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .service-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .app-number {
      font-size: 0.875rem;
      color: #64748b;
    }

    .amount-display {
      font-size: 1.75rem;
      font-weight: 700;
      color: #059669;
    }

    .card-details {
      display: grid;
      gap: 0.75rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .detail-value {
      font-weight: 600;
      color: #1e293b;
    }

    .method-badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .method-badge.card {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .method-badge.upi {
      background: #fef3c7;
      color: #d97706;
    }

    .method-badge.banking {
      background: #e0e7ff;
      color: #4f46e5;
    }

    .method-badge.cash {
      background: #d1fae5;
      color: #059669;
    }

    .status-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      background: #d1fae5;
      color: #059669;
      text-transform: uppercase;
    }

    .summary-section {
      margin-top: 2rem;
    }

    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .summary-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1.5rem 0;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .summary-item {
      text-align: center;
      padding: 1rem;
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      border-radius: 8px;
    }

    .summary-label {
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.5rem;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #059669;
    }

    @media (max-width: 768px) {
      .my-payments-page {
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

      .transactions-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .transaction-card {
        padding: 1rem;
      }

      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .amount-display {
        font-size: 1.5rem;
      }

      .service-name {
        font-size: 1rem;
      }

      .detail-value {
        word-break: break-all;
        font-size: 0.875rem;
      }

      .summary-stats {
        flex-direction: column;
        gap: 1rem;
      }

      .summary-item {
        text-align: center;
      }

      .total-spent {
        width: 100%;
        padding: 0.875rem 1.25rem;
      }

      .total-spent .amount {
        font-size: 1.5rem;
      }

      .page-header h2 {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .my-payments-page {
        padding: 0.5rem;
      }

      .page-header h2 {
        font-size: 1.25rem;
      }

      .total-spent {
        padding: 0.625rem 0.875rem;
      }

      .total-spent .amount {
        font-size: 1.25rem;
      }

      .filters-section {
        padding: 0.75rem;
      }

      .search-input {
        padding: 0.75rem 2.5rem;
        font-size: 0.875rem;
      }

      .transaction-card {
        padding: 0.875rem;
      }

      .service-name {
        font-size: 0.9375rem;
      }

      .amount-display {
        font-size: 1.25rem;
      }

      .detail-label,
      .detail-value {
        font-size: 0.8125rem;
      }
    }
  `]
})
export class MyPaymentsComponent implements OnInit {
  transactions: any[] = [];
  filteredTransactions: any[] = [];
  loading = true;

  searchQuery = '';
  methodFilter = '';
  sortBy = 'newest';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    const token = localStorage.getItem('token');

    this.http.get(`${environment.apiUrl}/payments/my/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        this.transactions = response.data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.transactions = [];
        this.filteredTransactions = [];
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.transactions];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(txn =>
        txn.transactionId?.toLowerCase().includes(query) ||
        txn.serviceName?.toLowerCase().includes(query)
      );
    }

    // Method filter
    if (this.methodFilter) {
      filtered = filtered.filter(txn => txn.paymentMethod === this.methodFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime();
        case 'oldest':
          return new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime();
        case 'amount-high':
          return b.amount - a.amount;
        case 'amount-low':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    this.filteredTransactions = filtered;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.methodFilter = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.methodFilter || this.sortBy !== 'newest');
  }

  getTotalSpent(): number {
    return this.filteredTransactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
  }

  getAveragePayment(): number {
    const total = this.getTotalSpent();
    const count = this.filteredTransactions.length;
    return count > 0 ? Math.round(total / count) : 0;
  }

  getMethodClass(method: string): string {
    if (method?.toLowerCase().includes('card')) return 'card';
    if (method?.toLowerCase().includes('upi')) return 'upi';
    if (method?.toLowerCase().includes('banking')) return 'banking';
    if (method?.toLowerCase().includes('cash')) return 'cash';
    return 'card';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
