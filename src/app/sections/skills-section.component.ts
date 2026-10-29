import { Component, computed } from '@angular/core';
import { skillSubId } from '../core/nav-items';
import { SkillGroupView, SkillKind } from '../core/models';
import { RevealDirective } from '../shared/reveal.directive';
import { SectionBase, SectionShellComponent } from '../shared/section-shell.component';
import { GlowDirective } from '../shared/glow.directve';

/** Section Compétences avec ses deux sous-sections : professionnelles et personnelles. */
@Component({
  selector: 'app-skills-section',
  imports: [SectionShellComponent, GlowDirective, RevealDirective],
  template: `
    <app-section-shell [anchor]="anchor()" [title]="title()">
      @for (sub of subsections(); track sub.kind) {
        <div class="subsection" [id]="sub.id">
          <h3 class="subsection__title">{{ sub.label }}</h3>
          <div class="grid">
            @for (g of sub.groups; track $index) {
              <article class="card" appGlow appReveal [appRevealDelay]="$index * 60">
                <h4 class="card__title">{{ g.name }}</h4>
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
        </div>
      }
    </app-section-shell>
  `,
})
export class SkillsSectionComponent extends SectionBase {
  protected readonly subsections = computed(() => {
    const groups = this.items() as SkillGroupView[];
    const kinds: SkillKind[] = ['PROFESSIONAL', 'PERSONAL'];
    return kinds
      .map((kind) => ({
        kind,
        id: skillSubId(kind),
        label: kind === 'PROFESSIONAL' ? this.ui().skillsPro : this.ui().skillsPersonal,
        groups: groups.filter((g) => (g.kind ?? 'PROFESSIONAL') === kind),
      }))
      .filter((sub) => sub.groups.length);
  });
}