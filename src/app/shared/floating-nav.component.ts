import { Component, computed, effect, inject, signal } from '@angular/core';
import { PortfolioService } from '../core/portfolio.service';
import { buildNavItems, NavItem } from '../core/nav-items';
import { scrollToAnchor } from '../core/util';

/**
 * Menu vertical fixe placé dans la largeur du contenu (comme une documentation) :
 * il reste visible pendant le défilement et met en évidence la section en cours.
 */
@Component({
  selector: 'app-floating-nav',
  host: { '(window:scroll)': 'schedule()', '(window:resize)': 'schedule()' },
  template: `
    <nav class="floating-nav" [attr.aria-label]="svc.ui().menu">
      @for (item of items(); track item.id) {
        <div class="floating-nav__group">
          <a
            [href]="'#' + item.id"
            [class.is-active]="active() === item.id"
            [class.is-parent]="isParent(item)"
            [attr.aria-current]="active() === item.id ? 'location' : null"
            (click)="go($event, item.id)"
          >{{ item.label }}</a>
          @if (item.children.length) {
            <div class="floating-nav__sub">
              @for (child of item.children; track child.id) {
                <a
                  [href]="'#' + child.id"
                  [class.is-active]="active() === child.id"
                  [attr.aria-current]="active() === child.id ? 'location' : null"
                  (click)="go($event, child.id)"
                >{{ child.label }}</a>
              }
            </div>
          }
        </div>
      }
    </nav>
  `,
})
export class FloatingNavComponent {
  protected readonly svc = inject(PortfolioService);
  protected readonly go = scrollToAnchor;
  protected readonly active = signal('');

  protected readonly items = computed(() => {
    const p = this.svc.portfolio();
    return p ? buildNavItems(p.sections, this.svc.ui()) : [];
  });

  private frame = 0;

  constructor() {
    // Après chaque changement de contenu (marché, langue), recalcule la section en cours une fois le DOM à jour.
    effect(() => {
      this.items();
      setTimeout(() => this.update(), 80);
    });
  }

  protected isParent(item: NavItem): boolean {
    return item.children.some((child) => child.id === this.active());
  }

  protected schedule(): void {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.update());
  }

  /** Section en cours : la dernière dont le haut a dépassé la ligne de lecture, dans l'ordre du document. */
  private update(): void {
    const ids = this.items().flatMap((item) => [item.id, ...item.children.map((child) => child.id)]);
    const line = 150;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    let current = '';
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element && element.getBoundingClientRect().top <= line) current = id;
    }
    this.active.set(atBottom && ids.length ? ids[ids.length - 1] : current);
  }
}