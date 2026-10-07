import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#191919] text-[#e6e6e5] w-full">
      @if (showPublicNavbar()) {
        <app-navbar></app-navbar>
      }
      
      <main class="flex-1 flex flex-col w-full">
        <router-outlet></router-outlet>
      </main>

      <app-toast></app-toast>
    </div>
  `,
})
export class AppComponent {
  title = 'MPloyChek';
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUrl = '';

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = event.urlAfterRedirects || event.url;
      });
  }

  showPublicNavbar(): boolean {
    const url = this.currentUrl || this.router.url;
    // Hide floating public navbar on protected workspace views
    if (
      url.startsWith('/dashboard') ||
      url.startsWith('/admin') ||
      url.startsWith('/telemetry')
    ) {
      return false;
    }
    // On docs page, if user is logged in, the sidebar is used instead
    if (url.startsWith('/docs') && this.authService.isAuthenticated()) {
      return false;
    }
    return true;
  }
}
