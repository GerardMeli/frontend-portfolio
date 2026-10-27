import { Component, inject } from '@angular/core';
import { PortfolioService } from '../core/portfolio.service';

/** Écran de chargement (avec message si le serveur se réveille) ou d'erreur avec bouton Réessayer. */
@Component({
  selector: 'app-status',
  template: `
    @if (svc.error(); as problem) {
      <div class="status" role="alert">
        <h1 class="status__title">{{ ui().errorTitle }}</h1>
        <p class="status__text">{{ problem.offline ? ui().errorOffline : problem.message }}</p>
        <button type="button" class="btn btn--grad" (click)="svc.reload()">{{ ui().retry }}</button>
      </div>
    } @else {
      <div class="status" role="status">
        <div class="status__bar"></div>
        <p class="status__text">{{ svc.slow() ? ui().waking : ui().loading }}</p>
      </div>
    }
  `,
})
export class StatusComponent {
  protected readonly svc = inject(PortfolioService);
  protected readonly ui = this.svc.ui;
}
