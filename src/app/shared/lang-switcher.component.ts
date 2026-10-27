import { Component, inject } from '@angular/core';
import { LANGS } from '../core/i18n';
import { PortfolioService } from '../core/portfolio.service';

@Component({
  selector: 'app-lang-switcher',
  template: `
    <div class="seg" role="radiogroup" [attr.aria-label]="svc.ui().language">
      @for (lang of langs; track lang) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="lang === svc.portfolio()?.lang"
          [class.is-active]="lang === svc.portfolio()?.lang"
          (click)="svc.setLang(lang)"
        >
          {{ lang.toUpperCase() }}
        </button>
      }
    </div>
  `,
})
export class LangSwitcherComponent {
  protected readonly svc = inject(PortfolioService);
  protected readonly langs = LANGS;
}
