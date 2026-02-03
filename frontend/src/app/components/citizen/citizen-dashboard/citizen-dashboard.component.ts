import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-container">
      <!-- Mobile Header -->
      <div class="mobile-header">
        <button class="hamburger-btn" (click)="toggleSidebar()">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        <div class="mobile-logo">CITIZEN</div>
        <div class="mobile-avatar">{{ initials }}</div>
      </div>

      <!-- Overlay for mobile -->
      <div class="sidebar-overlay" [class.active]="sidebarOpen" (click)="closeSidebar()"></div>

      <nav class="sidebar" [class.mobile-open]="sidebarOpen">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-text">
              <h3>CITIZEN</h3>
            </div>
          </div>
          <div class="user-info">
            <div class="avatar">{{ initials }}</div>
            <div class="user-details">
              <p class="user-name">{{ currentUser?.name }}</p>
              <p class="user-role">Citizen Account</p>
            </div>
          </div>
        </div>
        
        <ul class="nav-menu">
          <li>
            <a routerLink="/citizen/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 4C3 3.44772 3.44772 3 4 3H7C7.55228 3 8 3.44772 8 4V7C8 7.55228 7.55228 8 7 8H4C3.44772 8 3 7.55228 3 7V4Z" fill="currentColor"/>
                <path d="M3 13C3 12.4477 3.44772 12 4 12H7C7.55228 12 8 12.4477 8 13V16C8 16.5523 7.55228 17 7 17H4C3.44772 17 3 16.5523 3 16V13Z" fill="currentColor"/>
                <path d="M12 4C12 3.44772 12.4477 3 13 3H16C16.5523 3 17 3.44772 17 4V7C17 7.55228 16.5523 8 16 8H13C12.4477 8 12 7.55228 12 7V4Z" fill="currentColor"/>
                <path d="M13 12C12.4477 12 12 12.4477 12 13V16C12 16.5523 12.4477 17 13 17H16C16.5523 17 17 16.5523 17 16V13C17 12.4477 16.5523 12 16 12H13Z" fill="currentColor"/>
              </svg>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/citizen/applications" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4C4 2.89543 4.89543 2 6 2H10L12 4H14C15.1046 4 16 4.89543 16 6V14C16 15.1046 15.1046 16 14 16H6C4.89543 16 4 15.1046 4 14V4Z" fill="currentColor"/>
              </svg>
              <span>My Applications</span>
            </a>
          </li>
          <li>
            <a routerLink="/citizen/apply" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3C10.5523 3 11 3.44772 11 4V9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11H4C3.44772 11 3 10.5523 3 10C3 9.44772 3.44772 9 4 9H9V4C9 3.44772 9.44772 3 10 3Z" fill="currentColor"/>
              </svg>
              <span>Apply for Service</span>
            </a>
          </li>
          <li>
            <a routerLink="/citizen/profile" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z" fill="currentColor"/>
                <path d="M3.46447 16.4645C4.92893 15 7.28595 14 10 14C12.714 14 15.0711 15 16.5355 16.4645C17.2635 17.1924 17.2635 18.3137 16.5355 19.0416C15.0711 20.506 12.714 21.506 10 21.506C7.28595 21.506 4.92893 20.506 3.46447 19.0416C2.73653 18.3137 2.73653 17.1924 3.46447 16.4645Z" fill="currentColor"/>
              </svg>
              <span>Profile</span>
            </a>
          </li>
          <li>
            <a routerLink="/citizen/payments" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M2 8h16M6 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Payment History</span>
            </a>
          </li>
          <li>
            <a routerLink="/citizen/documents" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 2C4.89543 2 4 2.89543 4 4V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V7L11 2H6Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M11 2V7H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 10h4M8 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Document History</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <a (click)="logout()" class="logout-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 3C3 2.44772 3.44772 2 4 2H10C10.5523 2 11 2.44772 11 3V5C11 5.55228 10.5523 6 10 6C9.44772 6 9 5.55228 9 5V4H5V16H9V15C9 14.4477 9.44772 14 10 14C10.5523 14 11 14.4477 11 15V17C11 17.5523 10.5523 18 10 18H4C3.44772 18 3 17.5523 3 17V3Z" fill="currentColor"/>
              <path d="M14.2929 9.29289C13.9024 9.68342 13.9024 10.3166 14.2929 10.7071L15.5858 12H7C6.44772 12 6 11.5523 6 11C6 10.4477 6.44772 10 7 10H15.5858L14.2929 8.70711C13.9024 8.31658 13.9024 7.68342 14.2929 7.29289C14.6834 6.90237 15.3166 6.90237 15.7071 7.29289L18.7071 10.2929C19.0976 10.6834 19.0976 11.3166 18.7071 11.7071L15.7071 14.7071C15.3166 15.0976 14.6834 15.0976 14.2929 14.7071C13.9024 14.3166 13.9024 13.6834 14.2929 13.2929L15.5858 12H7C6.44772 12 6 11.5523 6 11C6 10.4477 6.44772 10 7 10H15.5858L14.2929 8.70711Z" fill="currentColor"/>
            </svg>
            <span>Logout</span>
          </a>
        </div>
      </nav>
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .dashboard-container {
      display: flex;
      min-height: 100vh;
      background: #f3f4f6;
    }

    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
    }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .logo svg {
      flex-shrink: 0;
    }

    .logo-text h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      color: white;
    }

    .logo-text span {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      color: white;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0;
    }

    .nav-menu {
      list-style: none;
      padding: 20px 16px;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-menu::-webkit-scrollbar {
      width: 6px;
    }

    .nav-menu::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .nav-menu::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    .nav-menu::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .nav-menu li {
      margin-bottom: 4px;
    }

    .nav-menu a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #cbd5e1;
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.2s;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .nav-menu a svg {
      flex-shrink: 0;
      opacity: 0.8;
    }

    .nav-menu a:hover {
      background: rgba(255, 255, 255, 0.08);
      color: white;
    }

    .nav-menu a:hover svg {
      opacity: 1;
    }

    .nav-menu a.active {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .nav-menu a.active svg {
      opacity: 1;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.2s;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      width: 100%;
    }

    .logout-btn svg {
      flex-shrink: 0;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.4);
    }

    .main-content {
      flex: 1;
      padding: 20px;
      background: #f3f4f6;
      overflow-x: hidden;
      overflow-y: auto;
      margin-left: 280px;
    }

    @media (max-width: 1024px) {
      .sidebar {
        width: 240px;
      }

      .main-content {
        margin-left: 240px;
      }
    }

    /* Mobile Styles */
    @media (max-width: 768px) {
      .mobile-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        color: white;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1001;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .hamburger-btn {
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .hamburger-line {
        width: 24px;
        height: 2px;
        background: white;
        border-radius: 2px;
        transition: all 0.3s;
      }

      .mobile-logo {
        font-size: 1.125rem;
        font-weight: 700;
        color: white;
      }

      .mobile-avatar {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.75rem;
        color: white;
      }

      .sidebar-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
      }

      .sidebar-overlay.active {
        display: block;
      }

      .sidebar {
        position: fixed;
        left: -100%;
        top: 0;
        width: 280px;
        height: 100vh;
        z-index: 1000;
        transition: left 0.3s ease;
      }

      .sidebar.mobile-open {
        left: 0;
      }

      .main-content {
        margin-left: 0;
        padding: 70px 12px 12px;
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        width: 85%;
      }

      .main-content {
        padding: 65px 8px 8px;
      }

      .nav-menu a {
        padding: 10px 12px;
        font-size: 0.875rem;
      }

      .sidebar-header {
        padding: 20px 16px;
      }

      .user-info {
        padding: 10px;
      }

      .avatar {
        width: 36px;
        height: 36px;
        font-size: 0.8125rem;
      }

      .user-name {
        font-size: 0.8125rem;
      }
    }

    /* Hide mobile header on desktop */
    @media (min-width: 769px) {
      .mobile-header {
        display: none;
      }

      .sidebar-overlay {
        display: none;
      }
    }
  `]
})
export class CitizenDashboardComponent implements OnInit {
  currentUser: any;
  sidebarOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  get initials(): string {
    const name = this.currentUser?.name || 'User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || 'U';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
