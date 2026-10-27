import { Component, inject, input } from '@angular/core';
import { PortfolioService } from '../core/portfolio.service';

/** Sélecteur de marché : le CV complet est rechargé au format du marché choisi. */
@Component({
  selector: 'app-market-switcher',
  template: `
    @if (svc.markets().length) {
      <div
        class="seg market"
        [class.market--compact]="compact()"
        role="radiogroup"
        [attr.aria-label]="ui().marketLabel"
      >
        @for (market of svc.markets(); track market.code) {
          <button
            type="button"
            role="radio"
            [attr.aria-checked]="market.code === current()"
            [class.is-active]="market.code === current()"
            (click)="svc.setMarket(market.code)"
          >
            {{ short(market.code, market.label) }}
          </button>
        }
      </div>
    }
  `,
})
export class MarketSwitcherComponent {
  protected readonly svc = inject(PortfolioService);
  protected readonly ui = this.svc.ui;
  readonly compact = input(false);

  protected current(): string | undefined {
    return this.svc.portfolio()?.market.code;
  }

  protected short(code: string, label: string): string {
    return this.ui().marketShort[code] ?? label;
  }
}
