import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-dashboard">
      <h2>Dashboard Overview</h2>

      <div *ngIf="loading" class="spinner"></div>

      <div *ngIf="!loading && stats" class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ stats.totalUsers }}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-info">
            <h3>{{ stats.totalCitizens }}</h3>
            <p>Citizens</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💼</div>
          <div class="stat-info">
            <h3>{{ stats.totalEmployees }}</h3>
            <p>Employees</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-info">
            <h3>{{ stats.totalApplications }}</h3>
            <p>Total Applications</p>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && stats" class="card">
        <h3>Applications by Status</h3>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of stats.applicationsByStatus">
              <td>{{ item._id }}</td>
              <td>{{ item.count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .stats-dashboard h2 {
      margin-bottom: 30px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stat-icon {
      font-size: 40px;
    }

    .stat-info h3 {
      font-size: 32px;
      margin: 0;
      color: #333;
    }

    .stat-info p {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .card h3 {
      margin-bottom: 15px;
    }
  `]
})
export class StatsComponent implements OnInit {
  stats: any = null;
  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.adminService.getDashboardStats()
      .subscribe({
        next: (response) => {
          this.stats = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          this.loading = false;
        }
      });
  }
}
