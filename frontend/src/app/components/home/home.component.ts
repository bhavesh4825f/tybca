import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../services/service.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="home-page">
      <!-- Header/Navbar -->
      <nav class="navbar">
        <div class="container nav-container">
          <div class="nav-brand">
            <div class="logo-circle">
              <img src="/img/logo.png" alt="DGSC Logo" class="logo-image">
            </div>
            <div class="brand-text">
              <h1 class="brand-title">DGSC</h1>
              <p class="brand-subtitle">Digital Government Service Consultancy</p>
            </div>
          </div>
          <ul class="nav-menu">
            <li><a href="#home" class="nav-link">Home</a></li>
            <li><a href="#services" class="nav-link">Services</a></li>
            <li><a href="#about" class="nav-link">About Us</a></li>
            <li><a href="#contact" class="nav-link">Contact</a></li>
            <li *ngIf="!isLoggedIn" class="dropdown">
              <button class="btn-login dropdown-toggle" (click)="toggleDropdown($event)">
                <span>Login</span>
                <svg class="arrow-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <div class="dropdown-menu" [class.show]="dropdownOpen">
                <a routerLink="/login" class="dropdown-item" (click)="closeDropdown()">
                  <span class="item-icon">👤</span>
                  <span>Citizen Login</span>
                </a>
                <a routerLink="/employee-login" class="dropdown-item" (click)="closeDropdown()">
                  <span class="item-icon">👨‍💼</span>
                  <span>Employee Login</span>
                </a>
                <a routerLink="/admin-login" class="dropdown-item" (click)="closeDropdown()">
                  <span class="item-icon">⚙️</span>
                  <span>Admin Login</span>
                </a>
              </div>
            </li>
            <li *ngIf="isLoggedIn" class="dropdown user-dropdown">
              <button class="user-badge" (click)="toggleUserDropdown($event)">
                <span class="user-icon">👤</span>
                <span class="user-name">{{ currentUser?.name }}</span>
                <svg class="arrow-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <div class="dropdown-menu" [class.show]="userDropdownOpen">
                <a [routerLink]="getDashboardRoute()" class="dropdown-item" (click)="closeUserDropdown()">
                  <span class="item-icon">📊</span>
                  <span>Dashboard</span>
                </a>
                <a (click)="logout()" class="dropdown-item">
                  <span class="item-icon">🚪</span>
                  <span>Logout</span>
                </a>
              </div>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero" id="home">
        <div class="hero-bg-image"></div>
        <div class="hero-bg-pattern"></div>
        <div class="container">
          <div class="hero-wrapper">
            <div class="hero-content">
              <div class="hero-badge">
                <span class="badge-dot"></span>
                <span>Trusted by 1000+ Citizens</span>
              </div>
              <h1 class="hero-title">
                <span class="title-line">Your Gateway to</span>
                <span class="title-highlight">Digital Government Services</span>
              </h1>
              <p class="hero-description">
                Access all government services from the comfort of your home. Fast, secure, and reliable 
                document processing with expert assistance at every step.
              </p>
              
              <div class="search-container">
                <div class="search-wrapper">
                  <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <input 
                    type="text" 
                    class="search-input" 
                    placeholder="Search for services (e.g., PAN Card, Birth Certificate...)" 
                    [(ngModel)]="searchQuery" 
                    (input)="onSearchChange()" />
                </div>
                <div class="autocomplete-dropdown" *ngIf="filteredServices.length">
                  <div class="autocomplete-item" 
                       *ngFor="let s of filteredServices" 
                       (click)="selectService(s)">
                    <div class="service-icon">📄</div>
                    <div class="service-info">
                      <div class="service-name">{{ s.name }}</div>
                      <div class="service-meta">Starting from ₹{{ s.fee }} • {{ s.processingTime }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="cta-buttons">
                <button class="btn-primary" routerLink="/register">
                  <span>Get Started</span>
                  <svg class="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
                <button class="btn-secondary" (click)="scrollToServices()">
                  <span>Browse Services</span>
                </button>
              </div>

              <div class="trust-badges">
                <div class="trust-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" fill="rgba(255,255,255,0.2)"/>
                  </svg>
                  <span>Secure</span>
                </div>
                <div class="trust-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" fill="rgba(255,255,255,0.2)"/>
                  </svg>
                  <span>Fast Processing</span>
                </div>
                <div class="trust-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="rgba(255,255,255,0.2)"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>24/7 Available</span>
                </div>
              </div>
            </div>

            <div class="hero-visual">
              <div class="stats-cards">
                <div class="stat-card stat-card-1">
                  <div class="stat-icon">✓</div>
                  <div class="stat-content">
                    <div class="stat-number">1000+</div>
                    <div class="stat-label">Happy Customers</div>
                  </div>
                </div>
                <div class="stat-card stat-card-2">
                  <div class="stat-icon">⚡</div>
                  <div class="stat-content">
                    <div class="stat-number">24hrs</div>
                    <div class="stat-label">Avg. Processing</div>
                  </div>
                </div>
                <div class="stat-card stat-card-3">
                  <div class="stat-icon">🎯</div>
                  <div class="stat-content">
                    <div class="stat-number">98%</div>
                    <div class="stat-label">Success Rate</div>
                  </div>
                </div>
              </div>

              <div class="process-flow">
                <div class="flow-step">
                  <div class="step-number">1</div>
                  <div class="step-label">Choose Service</div>
                </div>
                <div class="flow-connector"></div>
                <div class="flow-step">
                  <div class="step-number">2</div>
                  <div class="step-label">Upload Documents</div>
                </div>
                <div class="flow-connector"></div>
                <div class="flow-step">
                  <div class="step-number">3</div>
                  <div class="step-label">Get Verified</div>
                </div>
                <div class="flow-connector"></div>
                <div class="flow-step">
                  <div class="step-number">4</div>
                  <div class="step-label">Download</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Why Choose Us</span>
            <h2 class="section-title">Everything You Need in One Place</h2>
            <p class="section-description">
              We provide comprehensive digital government services with unmatched reliability and efficiency
            </p>
          </div>

          <div class="features-grid">
            <div class="feature-box">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">🔒</div>
              </div>
              <h3>100% Secure</h3>
              <p>Bank-level encryption and government-grade security for all your documents</p>
            </div>

            <div class="feature-box">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">⚡</div>
              </div>
              <h3>Lightning Fast</h3>
              <p>Quick processing with average turnaround time of 24-48 hours</p>
            </div>

            <div class="feature-box">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">🎯</div>
              </div>
              <h3>Expert Assistance</h3>
              <p>Dedicated consultants to guide you through every step of the process</p>
            </div>

            <div class="feature-box">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">📱</div>
              </div>
              <h3>Mobile Friendly</h3>
              <p>Access all services seamlessly from any device, anywhere, anytime</p>
            </div>

            <div class="feature-box">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">🔔</div>
              </div>
              <h3>Real-time Tracking</h3>
              <p>Get instant updates and notifications about your application status</p>
            </div>

            <div class="feature-box">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">💳</div>
              </div>
              <h3>Secure Payments</h3>
              <p>Multiple payment options with 100% secure transaction gateway</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section class="services-section" id="services">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">Our Services</span>
            <h2 class="section-title">Popular Government Services</h2>
            <p class="section-description">
              Fast, secure, and reliable government document services at your fingertips
            </p>
          </div>

          <div *ngIf="loading" class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading services...</p>
          </div>

          <div class="services-grid-modern" *ngIf="!loading && services.length">
            <div class="service-card-modern" *ngFor="let service of services">
              <div class="service-header">
                <div class="service-icon-badge">📄</div>
                <div class="service-tag">Popular</div>
              </div>
              <h3 class="service-title">{{ service.name }}</h3>
              <p class="service-desc">{{ service.description }}</p>
              
              <div class="service-details">
                <div class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 4v4l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>{{ service.processingTime }}</span>
                </div>
                <div class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 5v3M8 11h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>Online Verification</span>
                </div>
              </div>

              <div class="service-footer">
                <div class="service-price-tag">
                  <span class="price-label">Starting at</span>
                  <span class="price-value">₹{{ service.fee }}</span>
                </div>
                <button class="btn-apply-modern" 
                        [routerLink]="isLoggedIn && currentUser?.role === 'citizen' ? '/citizen/apply' : '/register'">
                  <span>{{ isLoggedIn ? 'Apply Now' : 'Get Started' }}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="view-all-services" *ngIf="!loading">
            <button class="btn-view-all" routerLink="/register">
              View All Services
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="about-section" id="about">
        <div class="container">
          <div class="about-wrapper">
            <div class="about-content">
              <span class="section-badge">About DGSC</span>
              <h2 class="section-title">Transforming Government Services Digitally</h2>
              <p class="about-description">
                DGSC is your trusted partner for accessing government services online. We bridge the 
                gap between citizens and government offices, making essential administrative processes 
                simple, fast, and transparent.
              </p>
              <p class="about-description">
                Our platform eliminates long queues, reduces paperwork, and provides a seamless digital 
                experience for all your government document needs. With expert consultants and advanced 
                technology, we ensure your applications are processed efficiently and accurately.
              </p>

              <div class="about-stats">
                <div class="about-stat">
                  <div class="stat-value">5000+</div>
                  <div class="stat-label">Applications Processed</div>
                </div>
                <div class="about-stat">
                  <div class="stat-value">98%</div>
                  <div class="stat-label">Success Rate</div>
                </div>
                <div class="about-stat">
                  <div class="stat-value">24/7</div>
                  <div class="stat-label">Customer Support</div>
                </div>
              </div>
            </div>

            <div class="about-visual">
              <div class="visual-card card-1">
                <div class="card-icon">🎯</div>
                <h4>Our Mission</h4>
                <p>Digitize and streamline government services for every citizen</p>
              </div>
              <div class="visual-card card-2">
                <div class="card-icon">🔍</div>
                <h4>Our Vision</h4>
                <p>Leading digital platform for transparent government services</p>
              </div>
              <div class="visual-card card-3">
                <div class="card-icon">💎</div>
                <h4>Our Values</h4>
                <p>Transparency, efficiency, security, and customer-first approach</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="contact-section" id="contact">
        <div class="container">
          <div class="contact-wrapper">
            <div class="contact-info">
              <span class="section-badge">Get In Touch</span>
              <h2 class="section-title">Have Questions? We're Here to Help</h2>
              <p class="contact-description">
                Our team of experts is available 24/7 to assist you with any queries about 
                our services or application process.
              </p>

              <div class="contact-methods">
                <div class="contact-method">
                  <div class="method-icon">📧</div>
                  <div class="method-details">
                    <div class="method-label">Email Us</div>
                    <div class="method-value">support&#64;dgsc.gov.in</div>
                  </div>
                </div>
                <div class="contact-method">
                  <div class="method-icon">📞</div>
                  <div class="method-details">
                    <div class="method-label">Call Us</div>
                    <div class="method-value">1800-XXX-XXXX</div>
                  </div>
                </div>
                <div class="contact-method">
                  <div class="method-icon">⏰</div>
                  <div class="method-details">
                    <div class="method-label">Working Hours</div>
                    <div class="method-value">24/7 Available</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="contact-form-wrapper">
              <form class="contact-form-modern" (ngSubmit)="submitContact()">
                <div class="form-group">
                  <label>Your Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    [(ngModel)]="contactForm.name" 
                    name="name" 
                    required>
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="your.email@example.com" 
                    [(ngModel)]="contactForm.email" 
                    name="email" 
                    required>
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    [(ngModel)]="contactForm.phone" 
                    name="phone" 
                    required>
                </div>
                <div class="form-group">
                  <label>Your Message</label>
                  <textarea 
                    placeholder="How can we help you?" 
                    rows="5" 
                    [(ngModel)]="contactForm.message" 
                    name="message" 
                    required></textarea>
                </div>
                <button type="submit" class="btn-submit-modern">
                  <span>Send Message</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18 2L9 11M18 2l-6 16-3-7-7-3 16-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </form>
              <div *ngIf="contactSuccess" class="success-message">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" fill="#10b981"/>
                  <path d="M6 10l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Message sent successfully! We'll get back to you soon.</span>
              </div>
              <div *ngIf="contactError" class="error-message">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" fill="#ef4444"/>
                  <path d="M10 6v5M10 13v1" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>{{ contactError }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer-modern">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section footer-brand-section">
              <div class="footer-logo-modern">
                <div class="footer-logo-icon">
                  <img src="/img/logo.png" alt="DGSC Logo" class="footer-logo-image">
                </div>
                <div class="footer-brand-info">
                  <h3>DGSC</h3>
                  <p>Digital Government Service Consultancy</p>
                </div>
              </div>
              <p class="footer-tagline">
                Your trusted partner for fast, secure, and reliable government services available 24/7.
              </p>
              <div class="footer-social">
                <a href="#" class="social-link">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
                  </svg>
                </a>
                <a href="#" class="social-link">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
                <a href="#" class="social-link">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 0C4.477 0 0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div class="footer-section">
              <h4>Quick Links</h4>
              <ul class="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div class="footer-section">
              <h4>Popular Services</h4>
              <ul class="footer-links">
                <li><a routerLink="/register">PAN Card</a></li>
                <li><a routerLink="/register">Birth Certificate</a></li>
                <li><a routerLink="/register">Caste Certificate</a></li>
                <li><a routerLink="/register">Income Certificate</a></li>
              </ul>
            </div>

            <div class="footer-section">
              <h4>Newsletter</h4>
              <p class="newsletter-text">Subscribe to get updates on new services and features</p>
              <form class="newsletter-form" (submit)="subscribeNewsletter($event)">
                <input 
                  type="email" 
                  class="newsletter-input-modern" 
                  placeholder="Enter your email" 
                  required />
                <button class="newsletter-btn" type="submit">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18 2L9 11M18 2l-6 16-3-7-7-3 16-6z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>

          <div class="footer-bottom-modern">
            <p class="copyright">© 2025 DGSC - Digital Government Service Consultancy. All Rights Reserved.</p>
            <p class="disclaimer-modern">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="2"/>
                <path d="M8 4v4M8 11h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              This is a consultancy platform and does not represent any government department
            </p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .home-page {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      overflow-x: hidden;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* ========== Navbar ========== */
    .navbar {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
    }

    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-circle {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      overflow: hidden;
    }

    .logo-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 2px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }

    .brand-subtitle {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
    }

    .nav-menu {
      display: flex;
      list-style: none;
      gap: 2rem;
      align-items: center;
    }

    .nav-link {
      color: #334155;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s;
      position: relative;
    }

    .nav-link:hover {
      color: #667eea;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s;
    }

    .nav-link:hover::after {
      width: 100%;
    }

    .dropdown {
      position: relative;
    }

    .btn-login {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.65rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .arrow-icon {
      transition: transform 0.3s;
    }

    .dropdown:hover .arrow-icon,
    .dropdown.open .arrow-icon {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      display: none;
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: white;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      min-width: 200px;
      overflow: hidden;
      z-index: 1000;
    }

    .dropdown-menu.show {
      display: block;
      animation: dropdownSlide 0.3s ease;
    }

    @keyframes dropdownSlide {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown:hover .dropdown-menu {
      display: block;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      color: #334155;
      text-decoration: none;
      transition: all 0.3s;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
    }

    .dropdown-item:last-child {
      border-bottom: none;
    }

    .dropdown-item:hover {
      background: linear-gradient(90deg, #f8f9ff, #faf5ff);
      color: #667eea;
      padding-left: 2rem;
    }

    .item-icon {
      font-size: 1.2rem;
    }

    .user-dropdown {
      position: relative;
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%);
      padding: 0.65rem 1.25rem;
      border-radius: 10px;
      color: #667eea;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
    }

    .user-badge:hover {
      background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .user-badge .arrow-icon {
      transition: transform 0.3s;
      stroke: #667eea;
    }

    .user-dropdown.open .arrow-icon,
    .user-badge:hover .arrow-icon {
      transform: rotate(180deg);
    }

    .user-icon {
      font-size: 1.2rem;
    }

    /* ========== Hero Section ========== */
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 6rem 2rem;
      position: relative;
      overflow: hidden;
    }

    .hero-bg-image {
      position: absolute;
      inset: 0;
      background-image: url('/img/about-home-image.jpg');
      background-size: cover;
      background-position: center;
      opacity: 110;
      z-index: 0;
    }

    .hero-bg-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
      z-index: 0;
    }

    .hero-wrapper {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .hero-content {
      color: white;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: blink 1.5s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .hero-title {
      font-size: 3.5rem;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      font-weight: 800;
    }

    .title-line {
      display: block;
      font-size: 2.5rem;
      font-weight: 500;
      opacity: 0.95;
    }

    .title-highlight {
      display: block;
      background: linear-gradient(90deg, #fff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-description {
      font-size: 1.15rem;
      line-height: 1.8;
      opacity: 0.95;
      margin-bottom: 2rem;
      max-width: 550px;
    }

    .search-container {
      position: relative;
      margin-bottom: 2rem;
    }

    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1.5rem;
      color: #64748b;
    }

    .search-input {
      width: 100%;
      padding: 1.2rem 1.5rem 1.2rem 3.5rem;
      border: none;
      border-radius: 15px;
      font-size: 1rem;
      background: white;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
    }

    .search-input:focus {
      outline: none;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .autocomplete-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      right: 0;
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      max-height: 300px;
      overflow-y: auto;
      z-index: 10;
    }

    .autocomplete-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
      border-bottom: 1px solid #f1f5f9;
    }

    .autocomplete-item:last-child {
      border-bottom: none;
    }

    .autocomplete-item:hover {
      background: #f8f9ff;
    }

    .service-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .service-info {
      flex: 1;
    }

    .service-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .service-meta {
      font-size: 0.85rem;
      color: #64748b;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      color: #667eea;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.05rem;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .btn-arrow {
      transition: transform 0.3s;
    }

    .btn-primary:hover .btn-arrow {
      transform: translateX(5px);
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      padding: 1rem 2rem;
      font-size: 1.05rem;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      backdrop-filter: blur(10px);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-3px);
    }

    .trust-badges {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-size: 0.95rem;
      opacity: 0.95;
    }

    .trust-item svg {
      stroke: white;
    }

    /* Hero Visual */
    .hero-visual {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      padding: 1.5rem;
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.2);
    }

    .stat-card-3 {
      grid-column: 1 / -1;
    }

    .stat-icon {
      font-size: 2rem;
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .process-flow {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      padding: 1.5rem;
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .flow-step {
      flex: 1;
      text-align: center;
    }

    .step-number {
      width: 40px;
      height: 40px;
      background: white;
      color: #667eea;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin: 0 auto 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .step-label {
      font-size: 0.8rem;
      color: white;
      opacity: 0.95;
    }

    .flow-connector {
      width: 30px;
      height: 2px;
      background: rgba(255, 255, 255, 0.3);
      margin-top: -25px;
    }

    /* ========== Features Section ========== */
    .features-section {
      padding: 6rem 2rem;
      background: #f8fafc;
    }

    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .section-badge {
      display: inline-block;
      background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
      color: #667eea;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 2.75rem;
      color: #1e293b;
      margin-bottom: 1rem;
      font-weight: 800;
    }

    .section-description {
      font-size: 1.15rem;
      color: #64748b;
      max-width: 650px;
      margin: 0 auto;
      line-height: 1.8;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
    }

    .feature-box {
      background: white;
      padding: 2rem;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
      border: 1px solid #f1f5f9;
    }

    .feature-box:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
      border-color: #e0e7ff;
    }

    .feature-icon-wrapper {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .feature-icon {
      font-size: 2rem;
    }

    .feature-box h3 {
      font-size: 1.4rem;
      color: #1e293b;
      margin-bottom: 0.75rem;
      font-weight: 700;
    }

    .feature-box p {
      color: #64748b;
      line-height: 1.7;
      font-size: 1rem;
    }

    /* ========== Services Section ========== */
    .services-section {
      padding: 6rem 2rem;
      background: white;
    }

    .loading-spinner {
      text-align: center;
      padding: 3rem 0;
      color: #64748b;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f1f5f9;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .services-grid-modern {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .service-card-modern {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 2rem;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
    }

    .service-card-modern:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 50px rgba(102, 126, 234, 0.15);
      border-color: #c7d2fe;
    }

    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .service-icon-badge {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
    }

    .service-tag {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 0.4rem 0.8rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .service-title {
      font-size: 1.5rem;
      color: #1e293b;
      margin-bottom: 0.75rem;
      font-weight: 700;
    }

    .service-desc {
      color: #64748b;
      line-height: 1.7;
      margin-bottom: 1.5rem;
      flex: 1;
    }

    .service-details {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.9rem;
    }

    .detail-item svg {
      stroke: #667eea;
    }

    .service-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .service-price-tag {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .price-value {
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .btn-apply-modern {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.9rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-apply-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-apply-modern svg {
      transition: transform 0.3s;
    }

    .btn-apply-modern:hover svg {
      transform: translateX(4px);
    }

    .view-all-services {
      text-align: center;
    }

    .btn-view-all {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%);
      color: #667eea;
      border: 2px solid #e0e7ff;
      padding: 1rem 2.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1.05rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-view-all:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    /* ========== About Section ========== */
    .about-section {
      padding: 6rem 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .about-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .about-content {
      max-width: 550px;
    }

    .about-description {
      color: #64748b;
      line-height: 1.8;
      font-size: 1.05rem;
      margin-bottom: 1.5rem;
    }

    .about-stats {
      display: flex;
      gap: 2rem;
      margin-top: 2rem;
    }

    .about-stat {
      flex: 1;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.95rem;
    }

    .about-visual {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .visual-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
    }

    .visual-card:hover {
      transform: translateX(10px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
    }

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .visual-card h4 {
      font-size: 1.3rem;
      color: #1e293b;
      margin-bottom: 0.75rem;
      font-weight: 700;
    }

    .visual-card p {
      color: #64748b;
      line-height: 1.7;
    }

    /* ========== Contact Section ========== */
    .contact-section {
      padding: 6rem 2rem;
      background: white;
    }

    .contact-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: start;
    }

    .contact-description {
      color: #64748b;
      line-height: 1.8;
      font-size: 1.05rem;
      margin-bottom: 2rem;
    }

    .contact-methods {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .contact-method {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 12px;
      transition: all 0.3s;
    }

    .contact-method:hover {
      background: linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%);
      transform: translateX(5px);
    }

    .method-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .method-details {
      flex: 1;
    }

    .method-label {
      font-size: 0.85rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
    }

    .method-value {
      font-size: 1.1rem;
      color: #1e293b;
      font-weight: 600;
    }

    .contact-form-wrapper {
      position: relative;
    }

    .contact-form-modern {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #334155;
    }

    .form-group input,
    .form-group textarea {
      padding: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }

    .btn-submit-modern {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1.1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1.05rem;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-submit-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #d1fae5;
      color: #065f46;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      margin-top: 1rem;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fee2e2;
      color: #991b1b;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      margin-top: 1rem;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ========== Footer ========== */
    .footer-modern {
      background: #1e293b;
      color: white;
      padding: 4rem 2rem 2rem;
    }

    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .footer-brand-section {
      max-width: 350px;
    }

    .footer-logo-modern {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .footer-logo-icon {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      overflow: hidden;
    }

    .footer-logo-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 2px;
    }

    .footer-brand-info h3 {
      font-size: 1.5rem;
      margin: 0;
      font-weight: 700;
    }

    .footer-brand-info p {
      font-size: 0.75rem;
      margin: 0;
      opacity: 0.8;
    }

    .footer-tagline {
      opacity: 0.8;
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    .footer-social {
      display: flex;
      gap: 1rem;
    }

    .social-link {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      transition: all 0.3s;
    }

    .social-link:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transform: translateY(-3px);
    }

    .footer-section h4 {
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .footer-links a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.3s;
      display: inline-block;
    }

    .footer-links a:hover {
      color: white;
      transform: translateX(5px);
    }

    .newsletter-text {
      opacity: 0.8;
      font-size: 0.95rem;
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .newsletter-form {
      display: flex;
      gap: 0.5rem;
    }

    .newsletter-input-modern {
      flex: 1;
      padding: 0.8rem 1rem;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.95rem;
    }

    .newsletter-input-modern::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .newsletter-input-modern:focus {
      outline: none;
      border-color: #667eea;
      background: rgba(255, 255, 255, 0.15);
    }

    .newsletter-btn {
      width: 45px;
      height: 45px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .newsletter-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .newsletter-btn svg {
      stroke: white;
    }

    .footer-bottom-modern {
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }

    .copyright {
      opacity: 0.7;
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
    }

    .disclaimer-modern {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      opacity: 0.6;
      font-size: 0.85rem;
    }

    .disclaimer-modern svg {
      stroke: currentColor;
      flex-shrink: 0;
    }

    /* ========== Responsive ========== */
    @media (max-width: 1024px) {
      .hero-wrapper,
      .about-wrapper,
      .contact-wrapper {
        grid-template-columns: 1fr;
        gap: 3rem;
      }

      .hero-visual {
        order: -1;
      }

      .footer-content {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .nav-menu {
        display: none;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .title-line {
        font-size: 1.8rem;
      }

      .section-title {
        font-size: 2rem;
      }

      .features-grid,
      .services-grid-modern {
        grid-template-columns: 1fr;
      }

      .stats-cards {
        grid-template-columns: 1fr;
      }

      .cta-buttons {
        flex-direction: column;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
        justify-content: center;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .footer-brand-section {
        max-width: 100%;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  services: any[] = [];
  loading = false;
  isLoggedIn = false;
  currentUser: any = null;
  searchQuery = '';
  filteredServices: any[] = [];
  contactForm = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };
  contactSuccess = false;
  contactError = '';
  dropdownOpen = false;
  userDropdownOpen = false;

  constructor(
    private serviceService: ServiceService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUser();
    this.loadServices();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown')) {
        this.dropdownOpen = false;
        this.userDropdownOpen = false;
      }
    });
  }

  loadServices(): void {
    this.loading = true;
    this.serviceService.getAllServices()
      .subscribe({
        next: (response: any) => {
          this.services = response.data.slice(0, 3); // Show only 3 services
          this.filteredServices = [];
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading services:', error);
          this.loading = false;
        }
      });
  }

  submitContact(): void {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.phone || !this.contactForm.message) {
      this.contactError = 'All fields are required';
      setTimeout(() => this.contactError = '', 3000);
      return;
    }

    this.http.post('http://localhost:3000/api/contact/submit', this.contactForm)
      .subscribe({
        next: (response: any) => {
          this.contactSuccess = true;
          this.contactError = '';
          setTimeout(() => {
            this.contactSuccess = false;
            this.contactForm = { name: '', email: '', phone: '', message: '' };
          }, 3000);
        },
        error: (error: any) => {
          console.error('Contact submission error:', error);
          this.contactError = error.error?.message || 'Failed to send message. Please try again.';
          setTimeout(() => this.contactError = '', 5000);
        }
      });
  }
  onSearchChange(): void {
    const q = (this.searchQuery || '').toLowerCase().trim();
    if (!q) { this.filteredServices = []; return; }
    this.filteredServices = this.services
      .filter(s => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))
      .slice(0, 5);
  }
  selectService(service: any): void {
    this.searchQuery = service.name;
    this.filteredServices = [];
  }
  subscribeNewsletter(evt: Event): void {
    evt.preventDefault();
    alert('Subscribed successfully!');
  }

  scrollToServices(): void {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeUserDropdown(): void {
    this.userDropdownOpen = false;
  }

  getDashboardRoute(): string {
    if (!this.currentUser?.role) return '/';
    
    switch (this.currentUser.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'consultant':
        return '/consultant/dashboard';
      case 'citizen':
        return '/citizen/dashboard';
      default:
        return '/';
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.currentUser = null;
    this.userDropdownOpen = false;
    window.location.reload();
  }
}
