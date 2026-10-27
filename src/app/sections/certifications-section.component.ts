import { Component, computed } from '@angular/core';
import { CertificationView } from '../core/models';
import { GlowDirective } from '../shared/glow.directive';
import { RevealDirective } from '../shared/reveal.directive';
import { SectionBase, SectionShellComponent } from '../shared/section-shell.component';

@Component({
  selector: 'app-certifications-section',
  imports: [SectionShellComponent, GlowDirective, RevealDirective],
  template: `
    <app-section-shell [anchor]="anchor()" [title]="title()">
      <div class="grid">
        @for (c of rows(); track $index) {
          <article class="card" appGlow appReveal [appRevealDelay]="$index * 60">
            @if (date(c.issuedOn); as when) {
              <p class="card__when">{{ when }}</p>
            }
            <h3 class="card__title">{{ c.name }}</h3>
            @if (c.issuer) {
              <p class="card__sub">{{ c.issuer }}</p>
            }
            @if (c.credentialUrl; as url) {
              <a class="card__link" [href]="url" target="_blank" rel="noopener">{{ ui().credential }}</a>
            }
          </article>
        }
      </div>
    </app-section-shell>
  `,
})
export class CertificationsSectionComponent extends SectionBase {
  protected readonly rows = computed(() => this.items() as CertificationView[]);
}
