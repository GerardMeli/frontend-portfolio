import { Component, computed } from '@angular/core';
import { CustomItemView } from '../core/models';
import { prettyUrl } from '../core/util';
import { GlowDirective } from '../shared/glow.directive';
import { RevealDirective } from '../shared/reveal.directive';
import { SectionBase, SectionShellComponent } from '../shared/section-shell.component';

/** Section personnalisée créée depuis l'administration (bénévolat, références, publications...). */
@Component({
  selector: 'app-custom-section',
  imports: [SectionShellComponent, GlowDirective, RevealDirective],
  template: `
    <app-section-shell [anchor]="anchor()" [title]="title()">
      <div class="grid">
        @for (i of rows(); track $index) {
          <article class="card" appGlow appReveal [appRevealDelay]="$index * 60">
            @if (period(i.startDate, i.endDate); as when) {
              <p class="card__when">{{ when }}</p>
            }
            <h3 class="card__title">{{ i.title }}</h3>
            @if (i.subtitle) {
              <p class="card__sub">{{ i.subtitle }}</p>
            }
            @if (i.description) {
              <p class="card__text">{{ i.description }}</p>
            }
            @if (i.url; as url) {
              <a class="card__link" [href]="url" target="_blank" rel="noopener">{{ pretty(url) }}</a>
            }
          </article>
        }
      </div>
    </app-section-shell>
  `,
})
export class CustomSectionComponent extends SectionBase {
  protected readonly rows = computed(() => this.items() as CustomItemView[]);
  protected readonly pretty = prettyUrl;
}
