import { Component, computed } from '@angular/core';
import { ProjectView } from '../core/models';
import { prettyUrl } from '../core/util';
import { GlowDirective } from '../shared/glow.directive';
import { RevealDirective } from '../shared/reveal.directive';
import { SectionBase, SectionShellComponent } from '../shared/section-shell.component';

@Component({
  selector: 'app-projects-section',
  imports: [SectionShellComponent, GlowDirective, RevealDirective],
  template: `
    <app-section-shell [anchor]="anchor()" [title]="title()">
      <div class="grid grid--wide">
        @for (p of rows(); track $index) {
          <article class="card card--project" appGlow appReveal [appRevealDelay]="$index * 60">
            <div class="card__head">
              <h3 class="card__title">{{ p.name }}</h3>
              <span class="chip chip--accent">{{ label(ui().kind, p.kind) }}</span>
            </div>
            @if (period(p.startDate, p.endDate); as when) {
              <p class="card__when">{{ when }}</p>
            }
            @if (p.description) {
              <p class="card__text">{{ p.description }}</p>
            }
            @if (p.highlights.length) {
              <ul class="bullets">
                @for (h of p.highlights; track $index) {
                  <li>{{ h }}</li>
                }
              </ul>
            }
            @if (p.techStack.length) {
              <ul class="chips">
                @for (t of p.techStack; track t) {
                  <li class="chip">{{ t }}</li>
                }
              </ul>
            }
            @if (p.demoUrl || p.repoUrl) {
              <div class="card__links">
                @if (p.demoUrl; as url) {
                  <a class="btn btn--ghost btn--sm" [href]="url" target="_blank" rel="noopener" [title]="pretty(url)">{{ ui().demo }}</a>
                }
                @if (p.repoUrl; as url) {
                  <a class="btn btn--ghost btn--sm" [href]="url" target="_blank" rel="noopener" [title]="pretty(url)">{{ ui().code }}</a>
                }
              </div>
            }
          </article>
        }
      </div>
    </app-section-shell>
  `,
})
export class ProjectsSectionComponent extends SectionBase {
  protected readonly rows = computed(() => this.items() as ProjectView[]);
  protected readonly pretty = prettyUrl;
}
