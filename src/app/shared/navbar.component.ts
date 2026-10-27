import { Component, computed, inject, signal } from '@angular/core';
import { PortfolioService } from '../core/portfolio.service';
import { ThemeService } from '../core/theme.service';
import { anchorOf, initialsOf, scrollToAnchor } from '../core/util';
import { LangSwitcherComponent } from './lang-switcher.component';
import { MarketSwitcherComponent } from './market-switcher.component';

@Component({
  selector: 'app-navbar',
  imports: [MarketSwitcherComponent, LangSwitcherComponent],
  host: { '(window:scroll)': 'onScroll()' },
  template: `
    <header class="nav" [class.is-scrolled]="scrolled()">
      <div class="wrap nav__bar">
        <a class="nav__brand" href="#top" (click)="go($event, 'top')">
          <span class="nav__mark" aria-hidden="true">{{ initials() }}</span>
          <span class="nav__name">{{ name() }}</span>
        </a>

        <nav class="nav__links" [class.is-open]="open()" aria-label="Sections">
          @for (section of sections(); track section.type) {
            <a [href]="'#' + anchor(section.type)" (click)="pick($event, anchor(section.type))">{{ section.title }}</a>
          }
          <a href="#contact" (click)="pick($event, 'contact')">{{ ui().contact }}</a>
        </nav>

        <div class="nav__tools">
          <app-market-switcher [compact]="true" />
          <app-lang-switcher />
          <button
            type="button"
            class="icon-btn"
            (click)="theme.cycle()"
            [attr.aria-label]="ui().theme[theme.mode()]"
            [title]="ui().theme[theme.mode()]"
          >
            @switch (theme.mode()) {
              @case ('light') {
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              }
              @case ('dark') {
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              }
              @default {
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
                </svg>
              }
            }
          </button>
          <button
            type="button"
            class="icon-btn nav__burger"
            (click)="open.set(!open())"
            [attr.aria-expanded]="open()"
            [attr.aria-label]="ui().menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  protected readonly svc = inject(PortfolioService);
  protected readonly theme = inject(ThemeService);
  protected readonly ui = this.svc.ui;
  protected readonly open = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly anchor = anchorOf;
  protected readonly go = scrollToAnchor;

  protected readonly sections = computed(() => this.svc.portfolio()?.sections ?? []);
  protected readonly name = computed(() => this.svc.portfolio()?.profile.fullName ?? '');
  protected readonly initials = computed(() => initialsOf(this.name()));

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  protected pick(event: Event, id: string): void {
    scrollToAnchor(event, id);
    this.open.set(false);
  }
}
