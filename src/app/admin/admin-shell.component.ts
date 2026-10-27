import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../core/theme.service';
import { AuthService } from '../core/auth/service';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="adm">
      <aside class="adm__side" [class.is-open]="open()">
        <a class="adm__brand" routerLink="/admin">Administration</a>
        <nav aria-label="Administration">
          @for (link of links; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="is-active" (click)="open.set(false)">{{ link.label }}</a>
          }
        </nav>
      </aside>
      @if (open()) {
        <button type="button" class="adm__scrim" aria-label="Fermer le menu" (click)="open.set(false)"></button>
      }

      <div class="adm__main">
        <header class="adm__top">
          <button type="button" class="icon-btn adm__burger" (click)="open.set(!open())" aria-label="Menu" [attr.aria-expanded]="open()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <span class="adm__spacer"></span>
          <a class="btn btn--ghost btn--sm" routerLink="/" target="_blank">Voir le site</a>
          <button type="button" class="btn btn--ghost btn--sm" (click)="theme.cycle()">{{ themeLabel[theme.mode()] }}</button>
          <button type="button" class="btn btn--ghost btn--sm" (click)="auth.logout()">Déconnexion</button>
        </header>
        <div class="adm__content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AdminShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly open = signal(false);
  protected readonly themeLabel = { dark: 'Thème sombre', light: 'Thème clair', auto: 'Thème auto' };

  protected readonly links = [
    { path: 'profile', label: 'Profil' },
    { path: 'experiences', label: 'Expériences' },
    { path: 'educations', label: 'Formations' },
    { path: 'projects', label: 'Projets' },
    { path: 'skills', label: 'Compétences' },
    { path: 'certifications', label: 'Certifications' },
    { path: 'languages', label: 'Langues' },
    { path: 'custom-sections', label: 'Sections perso' },
    { path: 'markets', label: 'Marchés et sections' },
  ];
}
