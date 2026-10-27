import { Component, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { PortfolioService } from './core/portfolio.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {
  constructor() {
    const portfolio = inject(PortfolioService);
    const title = inject(Title);
    inject(ThemeService); // applique le thème dès le démarrage
    portfolio.start();

    effect(() => {
      const p = portfolio.portfolio();
      if (!p) return;
      document.documentElement.lang = p.lang;
      // Sur la page CV, le titre est géré par la page elle-même.
      if (!window.location.pathname.startsWith('/cv')) {
        title.setTitle(p.profile.headline ? `${p.profile.fullName} - ${p.profile.headline}` : p.profile.fullName);
      }
    });
  }
}