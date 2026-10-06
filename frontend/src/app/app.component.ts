import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#191919] text-[#e6e6e5] w-full">
      <app-navbar></app-navbar>
      
      <main class="flex-1 flex flex-col w-full">
        <router-outlet></router-outlet>
      </main>

      <app-toast></app-toast>
    </div>
  `,
})
export class AppComponent {
  title = 'MPloyChek';
}
