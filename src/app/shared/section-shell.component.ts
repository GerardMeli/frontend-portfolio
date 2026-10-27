import { Component, Directive, inject, input } from '@angular/core';
import { PortfolioService } from '../core/portfolio.service';
import { formatDate, formatPeriod } from '../core/util';

/** Cadre commun des sections : ancre, titre centré et contenu projeté. */
@Component({
  selector: 'app-section-shell',
  template: `
    <section class="section" [id]="anchor()">
      <div class="wrap">
        <h2 class="section__title"><span>{{ title() }}</span></h2>
        <ng-content />
      </div>
    </section>
  `,
})
export class SectionShellComponent {
  readonly anchor = input.required<string>();
  readonly title = input.required<string>();
}

/** Base des composants de section : entrées communes et formatage des dates selon le marché. */
@Directive()
export abstract class SectionBase {
  protected readonly svc = inject(PortfolioService);
  protected readonly ui = this.svc.ui;

  readonly anchor = input.required<string>();
  readonly title = input.required<string>();
  readonly items = input.required<unknown[]>();

  protected date(iso?: string): string {
    const p = this.svc.portfolio();
    return p ? formatDate(iso, p.market.dateFormat, p.lang) : '';
  }

  protected period(start?: string, end?: string, current = false): string {
    const p = this.svc.portfolio();
    return p ? formatPeriod(start, end, current, p.market.dateFormat, p.lang, this.ui().present) : '';
  }

  protected label(map: Record<string, string>, key: string): string {
    return map[key] ?? key;
  }
}
