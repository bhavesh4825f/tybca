import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-history-page">
      <div class="page-header">
        <h2>Payment Transaction History</h2>
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-icon">₹</div>
            <div class="stat-info">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">₹{{ getTotalRevenue() }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">#</div>
            <div class="stat-info">
              <div class="stat-label">Total Transactions</div>
              <div class="stat-value">{{ filteredTransactions.length }}</div>
            </div>
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
            placeholder="Search by transaction ID, citizen name, or service..." 
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            class="search-input">
          <button *ngIf="searchQuery" (click)="clearSearch()" class="clear-btn">×</button>
        </div>

        <div class="filter-controls">
          <div class="filter-group">
            <label>Payment Method:</label>
            <select [(ngModel)]="methodFilter" (change)="applyFilters()" class="filter-select">
              <option value="">All Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Date Range:</label>
            <select [(ngModel)]="dateFilter" (change)="applyFilters()" class="filter-select">
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Sort By:</label>
            <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount (High to Low)</option>
              <option value="amount-low">Amount (Low to High)</option>
            </select>
          </div>

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
        <p>Loading transactions...</p>
      </div>

      <div *ngIf="!loading && filteredTransactions.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="4"/>
          <path d="M32 20v16M24 44h16" stroke="#9ca3af" stroke-width="4" stroke-linecap="round"/>
        </svg>
        <h3>No transactions found</h3>
        <p>{{ transactions.length === 0 ? 'No payment transactions yet.' : 'Try adjusting your filters.' }}</p>
      </div>

      <div *ngIf="!loading && filteredTransactions.length > 0" class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Application No.</th>
              <th>Citizen</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Date & Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let txn of filteredTransactions">
              <td><strong>{{ txn.transactionId }}</strong></td>
              <td>{{ txn.applicationNumber }}</td>
              <td>
                <div class="citizen-info">
                  <div class="citizen-name">{{ txn.citizenName }}</div>
                  <div class="citizen-email">{{ txn.citizenEmail }}</div>
                </div>
              </td>
              <td>{{ txn.serviceName }}</td>
              <td class="amount">₹{{ txn.amount }}</td>
              <td>
                <span class="method-badge" [class]="getMethodClass(txn.paymentMethod)">
                  {{ txn.paymentMethod }}
                </span>
              </td>
              <td>{{ formatDate(txn.paidAt) }}</td>
              <td>
                <span class="status-badge paid">{{ txn.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .payment-history-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1.5rem 0;
    }

    .header-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: linear-gradient(135deg, #dc2626, #991b1b);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      opacity: 0.9;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.875rem;
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
      padding: 0.875rem 3rem;
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

    .transactions-table {
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

    .citizen-info {
      display: flex;
      flex-direction: column;
    }

    .citizen-name {
      font-weight: 600;
      color: #1e293b;
    }

    .citizen-email {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    .amount {
      font-weight: 700;
      font-size: 1.125rem;
      color: #059669;
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
      display: inline-block;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .status-badge.paid {
      background: #d1fae5;
      color: #059669;
    }

    @media (max-width: 768px) {
      .payment-history-page {
        padding: 1rem;
      }

      .filter-controls {
        flex-direction: column;
      }

      .filter-group {
        width: 100%;
      }

      .transactions-table {
        overflow-x: auto;
      }

      table {
        min-width: 800px;
      }
    }
  `]
})
export class PaymentHistoryComponent implements OnInit {
  transactions: any[] = [];
  filteredTransactions: any[] = [];
  loading = true;

  searchQuery = '';
  methodFilter = '';
  dateFilter = '';
  sortBy = 'newest';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    const token = localStorage.getItem('token');

    this.http.get(`${environment.apiUrl}/payments/all/transactions`, {
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
        txn.citizenName?.toLowerCase().includes(query) ||
        txn.serviceName?.toLowerCase().includes(query)
      );
    }

    // Method filter
    if (this.methodFilter) {
      filtered = filtered.filter(txn => txn.paymentMethod === this.methodFilter);
    }

    // Date filter
    if (this.dateFilter) {
      const now = new Date();
      filtered = filtered.filter(txn => {
        const paidDate = new Date(txn.paidAt);
        switch (this.dateFilter) {
          case 'today':
            return paidDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return paidDate >= weekAgo;
          case 'month':
            return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
          case 'year':
            return paidDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
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
    this.dateFilter = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.methodFilter || this.dateFilter || this.sortBy !== 'newest');
  }

  getTotalRevenue(): number {
    return this.filteredTransactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
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
