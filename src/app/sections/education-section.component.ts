import { Component, computed } from '@angular/core';
import { EducationView } from '../core/models';
import { RevealDirective } from '../shared/reveal.directive';
import { SectionBase, SectionShellComponent } from '../shared/section-shell.component';
import { GlowDirective } from '../shared/glow.directve';

@Component({
  selector: 'app-education-section',
  imports: [SectionShellComponent, GlowDirective, RevealDirective],
  template: `
    <app-section-shell [anchor]="anchor()" [title]="title()">
      <div class="grid">
        @for (e of rows(); track $index) {
          <article class="card" appGlow appReveal [appRevealDelay]="$index * 60">
            @if (period(e.startDate, e.endDate); as when) {
              <p class="card__when">{{ when }}</p>
            }
            <h3 class="card__title">{{ e.degree }}</h3>
            @if (e.fieldOfStudy) {
              <p class="card__text">{{ e.fieldOfStudy }}</p>
            }
            <p class="card__sub">{{ e.institution }}{{ e.location ? ', ' + e.location : '' }}</p>
            @if (e.description) {
              <p class="card__text">{{ e.description }}</p>
            }
          </article>
        }
      </div>
    </app-section-shell>
  `,
})
export class EducationSectionComponent extends SectionBase {
  protected readonly rows = computed(() => this.items() as EducationView[]);
}
