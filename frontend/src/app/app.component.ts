import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

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

  currentUrl = '';

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = event.urlAfterRedirects || event.url;
      });
  }

  showPublicNavbar(): boolean {
    const rawUrl = this.currentUrl || this.router.url || '';
    const cleanUrl = rawUrl.split('?')[0].split('#')[0];
    return cleanUrl === '/' || cleanUrl === '';
  }
}
