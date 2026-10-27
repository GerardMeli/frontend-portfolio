import { Component, inject, input } from '@angular/core';
import { PortfolioService } from '../core/portfolio.service';
import { Profile } from '../core/models';
import { prettyUrl } from '../core/util';
import { SectionShellComponent } from '../shared/section-shell.component';
import { GlowDirective } from '../shared/glow.directve';

@Component({
  selector: 'app-contact-section',
  imports: [SectionShellComponent, GlowDirective],
  template: `
    <app-section-shell anchor="contact" [title]="ui().contact">
      <p class="contact__intro">{{ ui().contactIntro }}</p>
      <div class="contact__grid">
        @if (profile().email; as email) {
          <a class="card contact__item" appGlow [href]="'mailto:' + email">
            <span class="contact__label">{{ ui().emailLabel }}</span>
            <span class="contact__value">{{ email }}</span>
          </a>
        }
        @if (profile().phone; as phone) {
          <a class="card contact__item" appGlow [href]="'tel:' + phone">
            <span class="contact__label">{{ ui().phoneLabel }}</span>
            <span class="contact__value">{{ phone }}</span>
          </a>
        }
        @if (profile().linkedinUrl; as url) {
          <a class="card contact__item" appGlow [href]="url" target="_blank" rel="noopener">
            <span class="contact__label">LinkedIn</span>
            <span class="contact__value">{{ pretty(url) }}</span>
          </a>
        }
        @if (profile().githubUrl; as url) {
          <a class="card contact__item" appGlow [href]="url" target="_blank" rel="noopener">
            <span class="contact__label">GitHub</span>
            <span class="contact__value">{{ pretty(url) }}</span>
          </a>
        }
        @if (profile().websiteUrl; as url) {
          <a class="card contact__item" appGlow [href]="url" target="_blank" rel="noopener">
            <span class="contact__label">{{ ui().websiteLabel }}</span>
            <span class="contact__value">{{ pretty(url) }}</span>
          </a>
        }
      </div>
      @if (profile().email; as email) {
        <div class="contact__cta"><a class="btn btn--grad" [href]="'mailto:' + email">{{ ui().writeMe }}</a></div>
      }
    </app-section-shell>
  `,
})
export class ContactSectionComponent {
  protected readonly ui = inject(PortfolioService).ui;
  protected readonly pretty = prettyUrl;
  readonly profile = input.required<Profile>();
}
