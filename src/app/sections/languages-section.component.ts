import { Component, computed } from '@angular/core';
import { LanguageView } from '../core/models';
import { SectionBase, SectionShellComponent } from '../shared/section-shell.component';

@Component({
  selector: 'app-languages-section',
  imports: [SectionShellComponent],
  template: `
    <app-section-shell [anchor]="anchor()" [title]="title()">
      <ul class="chips chips--center">
        @for (l of rows(); track $index) {
          <li class="chip chip--lg">
            {{ l.name }}
            @if (l.level) {
              <span class="chip__level">{{ l.level }}</span>
            }
          </li>
        }
      </ul>
    </app-section-shell>
  `,
})
export class LanguagesSectionComponent extends SectionBase {
  protected readonly rows = computed(() => this.items() as LanguageView[]);
}
