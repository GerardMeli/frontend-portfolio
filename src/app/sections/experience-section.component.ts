import { Component, computed } from '@angular/core';
import { ExperienceView } from '../core/models';
import { GlowDirective } from '../shared/glow.directive';
import { RevealDirective } from '../shared/reveal.directive';
import { SectionBase, SectionShellComponent } from '../shared/section-shell.component';

@Component({
  selector: 'app-experience-section',
  imports: [SectionShellComponent, GlowDirective, RevealDirective],
  template: `
    <app-section-shell [anchor]="anchor()" [title]="title()">
      <ol class="timeline">
        @for (e of rows(); track $index) {
          <li class="timeline__item" appReveal [appRevealDelay]="$index * 60">
            <p class="timeline__when">{{ period(e.startDate, e.endDate, e.current) }}</p>
            <article class="card" appGlow>
              <div class="card__head">
                <div>
                  <h3 class="card__title">{{ e.title }}</h3>
                  <p class="card__sub">{{ e.company }}{{ e.location ? ', ' + e.location : '' }}</p>
                </div>
                @if (e.employmentType) {
                  <span class="chip">{{ label(ui().employment, e.employmentType) }}</span>
                }
              </div>
              @if (e.description) {
                <p class="card__text">{{ e.description }}</p>
              }
              @if (e.tasks.length) {
                <ul class="bullets">
                  @for (task of e.tasks; track $index) {
                    <li>{{ task }}</li>
                  }
                </ul>
              }
            </article>
          </li>
        }
      </ol>
    </app-section-shell>
  `,
})
export class ExperienceSectionComponent extends SectionBase {
  protected readonly rows = computed(() => this.items() as ExperienceView[]);
}
