import { Component, DestroyRef, computed, effect, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PortfolioService } from '../../core/portfolio.service';
import { LangSwitcherComponent } from '../../shared/lang-switcher.component';
import { MarketSwitcherComponent } from '../../shared/market-switcher.component';
import { StatusComponent } from '../../shared/status.component';
import { CvSheetComponent } from './cv-sheet.component';

/** CV imprimable : change de format (A4 ou Letter) selon le marché choisi. */
@Component({
  selector: 'app-cv-page',
  imports: [RouterLink, MarketSwitcherComponent, LangSwitcherComponent, StatusComponent, CvSheetComponent],
  template: `
    @if (svc.portfolio(); as p) {
      <div class="cvpage">
        <div class="cvbar">
          <div class="wrap cvbar__in">
            <a class="btn btn--ghost btn--sm" routerLink="/" [queryParams]="svc.queryParams()">{{ ui().back }}</a>
            <app-market-switcher />
            <app-lang-switcher />
            <span class="cvbar__info" [class.cvbar__warn]="tooLong()">{{ ui().cvPages(pages(), p.market.maxPages) }}</span>
            <button type="button" class="btn btn--grad btn--sm cvbar__print" (click)="print()">{{ ui().printCv }}</button>
          </div>
        </div>

        @if (tooLong()) {
          <p class="wrap cvpage__hint cvbar__warn">{{ ui().cvTooLong(p.market.maxPages) }}</p>
        }

        <div class="sheet-wrap" [class.is-switching]="svc.loading()">
          <app-cv-sheet [portfolio]="p" />
        </div>
      </div>
    } @else {
      <app-status />
    }
  `,
})
export class CvPageComponent {
  protected readonly svc = inject(PortfolioService);
  protected readonly ui = this.svc.ui;
  private readonly sheet = viewChild(CvSheetComponent);

  protected readonly pages = computed(() => this.sheet()?.pagesUsed() ?? 1);
  protected readonly tooLong = computed(() => {
    const p = this.svc.portfolio();
    return !!p && this.pages() > p.market.maxPages;
  });

  constructor() {
    const title = inject(Title);
    const previousTitle = title.getTitle();
    const pageStyle = document.createElement('style');
    document.head.appendChild(pageStyle);

    effect(() => {
      const p = this.svc.portfolio();
      if (!p) return;
      // Taille de page et marges d'impression selon le marché ; le nom du fichier PDF suit le titre.
      pageStyle.textContent = `@page { size: ${p.market.pageFormat === 'LETTER' ? 'letter' : 'A4'}; margin: 14mm 15mm; }`;
      title.setTitle(`${p.profile.fullName} - CV ${p.market.code}`);
    });

    inject(DestroyRef).onDestroy(() => {
      pageStyle.remove();
      title.setTitle(previousTitle);
    });
  }

  protected print(): void {
    window.print();
  }
}
