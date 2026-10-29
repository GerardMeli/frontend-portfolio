import { Component, inject } from '@angular/core';
import { PortfolioService } from '../../core/portfolio.service';
import { anchorOf } from '../../core/util';
import { AboutSectionComponent } from '../../sections/about-section.component';
import { CertificationsSectionComponent } from '../../sections/certifications-section.component';
import { ContactSectionComponent } from '../../sections/contact-section.component';
import { CustomSectionComponent } from '../../sections/custom-section.component';
import { EducationSectionComponent } from '../../sections/education-section.component';
import { ExperienceSectionComponent } from '../../sections/experience-section.component';
import { HeroComponent } from '../../sections/hero.component';
import { LanguagesSectionComponent } from '../../sections/languages-section.component';
import { ProjectsSectionComponent } from '../../sections/projects-section.component';
import { SkillsSectionComponent } from '../../sections/skills-section.component';
import { FloatingNavComponent } from '../../shared/floating-nav.component';
import { NavbarComponent } from '../../shared/navbar.component';
import { StatusComponent } from '../../shared/status.component';

/** Page publique : les sections s'affichent dans l'ordre défini par le backend pour le marché choisi. */
@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    FloatingNavComponent,
    StatusComponent,
    HeroComponent,
    AboutSectionComponent,
    ExperienceSectionComponent,
    EducationSectionComponent,
    ProjectsSectionComponent,
    SkillsSectionComponent,
    CertificationsSectionComponent,
    LanguagesSectionComponent,
    CustomSectionComponent,
    ContactSectionComponent,
  ],
  template: `
    @if (svc.portfolio(); as p) {
      <app-navbar />
      <main [class.is-switching]="svc.loading()">
        <app-hero [portfolio]="p" />

        <div class="page">
          <aside class="page__side"><app-floating-nav /></aside>
          <div class="page__content">
            @for (section of p.sections; track section.type) {
              @switch (section.type) {
                @case ('SUMMARY') {
                  <app-about-section [anchor]="anchor(section.type)" [title]="section.title" [items]="section.items" />
                }
                @case ('EXPERIENCE') {
                  <app-experience-section [anchor]="anchor(section.type)" [title]="section.title" [items]="section.items" />
                }
                @case ('EDUCATION') {
                  <app-education-section [anchor]="anchor(section.type)" [title]="section.title" [items]="section.items" />
                }
                @case ('PROJECT') {
                  <app-projects-section [anchor]="anchor(section.type)" [title]="section.title" [items]="section.items" />
                }
                @case ('SKILL') {
                  <app-skills-section [anchor]="anchor(section.type)" [title]="section.title" [items]="section.items" />
                }
                @case ('CERTIFICATION') {
                  <app-certifications-section [anchor]="anchor(section.type)" [title]="section.title" [items]="section.items" />
                }
                @case ('LANGUAGE') {
                  <app-languages-section [anchor]="anchor(section.type)" [title]="section.title" [items]="section.items" />
                }
                @default {
                  <app-custom-section [anchor]="anchor(section.type)" [title]="section.title" [items]="section.items" />
                }
              }
            }

            <app-contact-section [profile]="p.profile" />
          </div>
        </div>
      </main>

      <footer class="footer wrap">
        <p>© {{ year }} {{ p.profile.fullName }}</p>
        <p>{{ ui().footerMarket }} : {{ p.market.label }}</p>
      </footer>

      @if (svc.error(); as problem) {
        <div class="banner" role="alert">
          <span>{{ problem.offline ? ui().errorOffline : problem.message }}</span>
          <button type="button" class="btn btn--ghost btn--sm" (click)="svc.reload()">{{ ui().retry }}</button>
        </div>
      }
    } @else {
      <app-status />
    }
  `,
})
export class HomeComponent {
  protected readonly svc = inject(PortfolioService);
  protected readonly ui = this.svc.ui;
  protected readonly anchor = anchorOf;
  protected readonly year = new Date().getFullYear();
}