import { Component, computed } from '@angular/core';
import { SkillGroupView } from '../core/models';
import { RevealDirective } from '../shared/reveal.directive';
import { SectionBase, SectionShellComponent } from '../shared/section-shell.component';
import { GlowDirective } from '../shared/glow.directve';

@Component({
  selector: 'app-skills-section',
  imports: [SectionShellComponent, GlowDirective, RevealDirective],
  template: `
    <app-section-shell [anchor]="anchor()" [title]="title()">
      <div class="grid">
        @for (g of rows(); track $index) {
          <article class="card" appGlow appReveal [appRevealDelay]="$index * 60">
            <h3 class="card__title">{{ g.name }}</h3>
            <ul class="skills">
              @for (s of g.skills; track s.name) {
                <li class="skill">
                  <span class="skill__name">{{ s.name }}</span>
                  @if (s.level) {
                    <span class="skill__level">{{ s.level }}/5</span>
                    <span class="skill__bar"><i [style.--lvl]="s.level / 5"></i></span>
                  }
                </li>
              }
            </ul>
          </article>
        }
      </div>
    </app-section-shell>
  `,
})
export class SkillsSectionComponent extends SectionBase {
  protected readonly rows = computed(() => this.items() as SkillGroupView[]);
}
