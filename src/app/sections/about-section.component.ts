import { Component, computed } from '@angular/core';
import { SectionBase, SectionShellComponent } from '../shared/section-shell.component';

@Component({
  selector: 'app-about-section',
  imports: [SectionShellComponent],
  template: `
    <app-section-shell [anchor]="anchor()" [title]="title()">
      <div class="about">
        @for (paragraph of rows(); track $index) {
          <p>{{ paragraph }}</p>
        }
      </div>
    </app-section-shell>
  `,
})
export class AboutSectionComponent extends SectionBase {
  protected readonly rows = computed(() => this.items() as string[]);
}
