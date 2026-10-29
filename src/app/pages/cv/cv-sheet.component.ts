import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import {
  CertificationView,
  CustomItemView,
  EducationView,
  ExperienceView,
  LanguageView,
  Portfolio,
  ProjectView,
  Section,
  SkillGroupView,
  SkillKind,
} from '../../core/models';
import { PortfolioService } from '../../core/portfolio.service';
import { formatDate, formatFullDate, formatPeriod, prettyUrl } from '../../core/util';

const MM = 96 / 25.4; // pixels par millimètre
const MARGIN_MM = 14;

/**
 * Feuille de CV au format du marché (A4 ou Letter), prête à imprimer.
 * Photo, infos personnelles, dates et ordre des sections suivent les règles du marché.
 */
@Component({
  selector: 'app-cv-sheet',
  template: `
    <article class="sheet" [class.sheet--letter]="portfolio().market.pageFormat === 'LETTER'">
      <header class="sheet__head">
        <div class="sheet__id">
          <h1>{{ profile().fullName }}</h1>
          @if (profile().headline) {
            <p class="sheet__headline">{{ profile().headline }}</p>
          }
          <ul class="sheet__contact">
            @if (profile().email) { <li>{{ profile().email }}</li> }
            @if (profile().phone) { <li>{{ profile().phone }}</li> }
            @if (location()) { <li>{{ location() }}</li> }
            @if (profile().linkedinUrl; as url) { <li>{{ pretty(url) }}</li> }
            @if (profile().githubUrl; as url) { <li>{{ pretty(url) }}</li> }
            @if (profile().websiteUrl; as url) { <li>{{ pretty(url) }}</li> }
          </ul>
          @if (portfolio().market.showPersonalDetails) {
            <ul class="sheet__contact sheet__contact--dim">
              @if (profile().birthDate) { <li>{{ ui().born(fullDate(profile().birthDate)) }}</li> }
              @if (profile().nationality) { <li>{{ profile().nationality }}</li> }
              @if (profile().maritalStatus) { <li>{{ profile().maritalStatus }}</li> }
            </ul>
          }
          @if (profile().workAuthorization) {
            <p class="sheet__auth">{{ profile().workAuthorization }}</p>
          }
        </div>
        @if (portfolio().market.showPhoto && profile().photoUrl) {
          <img class="sheet__photo" [src]="profile().photoUrl" [alt]="profile().fullName" />
        }
      </header>

      @for (section of portfolio().sections; track section.type) {
        <section class="sheet__sec">
          <h2>{{ section.title }}</h2>
          @switch (section.type) {
            @case ('SUMMARY') {
              @for (text of texts(section); track $index) {
                <p>{{ text }}</p>
              }
            }
            @case ('EXPERIENCE') {
              @for (e of experiences(section); track $index) {
                <div class="sheet__item">
                  <div class="sheet__row">
                    <strong>{{ e.title }}</strong>
                    <span class="sheet__when">{{ period(e.startDate, e.endDate, e.current) }}</span>
                  </div>
                  <p class="sheet__sub">{{ e.company }}{{ e.location ? ', ' + e.location : '' }}</p>
                  @if (e.description) { <p>{{ e.description }}</p> }
                  @if (e.tasks.length) {
                    <ul class="sheet__list">
                      @for (task of e.tasks; track $index) { <li>{{ task }}</li> }
                    </ul>
                  }
                </div>
              }
            }
            @case ('EDUCATION') {
              @for (e of educations(section); track $index) {
                <div class="sheet__item">
                  <div class="sheet__row">
                    <strong>{{ e.degree }}{{ e.fieldOfStudy ? ', ' + e.fieldOfStudy : '' }}</strong>
                    <span class="sheet__when">{{ period(e.startDate, e.endDate, false) }}</span>
                  </div>
                  <p class="sheet__sub">{{ e.institution }}{{ e.location ? ', ' + e.location : '' }}</p>
                  @if (e.description) { <p>{{ e.description }}</p> }
                </div>
              }
            }
            @case ('PROJECT') {
              @for (p of projects(section); track $index) {
                <div class="sheet__item">
                  <div class="sheet__row">
                    <strong>{{ p.name }}</strong>
                    <span class="sheet__when">{{ period(p.startDate, p.endDate, false) }}</span>
                  </div>
                  @if (p.techStack.length) { <p class="sheet__sub">{{ p.techStack.join(', ') }}</p> }
                  @if (p.description) { <p>{{ p.description }}</p> }
                  @if (p.highlights.length) {
                    <ul class="sheet__list">
                      @for (h of p.highlights; track $index) { <li>{{ h }}</li> }
                    </ul>
                  }
                  @if (p.repoUrl || p.demoUrl) { <p class="sheet__sub">{{ pretty(p.repoUrl || p.demoUrl || '') }}</p> }
                </div>
              }
            }
            @case ('SKILL') {
              @for (sub of skillSubsections(section); track sub.kind) {
                @if (sub.showTitle) {
                  <h3 class="sheet__subtitle">{{ sub.label }}</h3>
                }
                @for (g of sub.groups; track $index) {
                  <p class="sheet__skill">
                    @if (g.name) { <strong>{{ g.name }} : </strong> }{{ skillNames(g) }}
                  </p>
                }
              }
            }
            @case ('CERTIFICATION') {
              @for (c of certifications(section); track $index) {
                <div class="sheet__row sheet__item">
                  <span><strong>{{ c.name }}</strong>{{ c.issuer ? ', ' + c.issuer : '' }}</span>
                  <span class="sheet__when">{{ date(c.issuedOn) }}</span>
                </div>
              }
            }
            @case ('LANGUAGE') {
              <p>{{ languageLine(section) }}</p>
            }
            @default {
              @for (i of customItems(section); track $index) {
                <div class="sheet__item">
                  <div class="sheet__row">
                    <strong>{{ i.title }}</strong>
                    <span class="sheet__when">{{ period(i.startDate, i.endDate, false) }}</span>
                  </div>
                  @if (i.subtitle) { <p class="sheet__sub">{{ i.subtitle }}</p> }
                  @if (i.description) { <p>{{ i.description }}</p> }
                </div>
              }
            }
          }
        </section>
      }
    </article>
  `,
})
export class CvSheetComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly svc = inject(PortfolioService);

  readonly portfolio = input.required<Portfolio>();
  /** Nombre de pages estimé d'après la hauteur du contenu. */
  readonly pagesUsed = signal(1);

  protected readonly ui = this.svc.ui;
  protected readonly pretty = prettyUrl;
  protected readonly profile = computed(() => this.portfolio().profile);
  protected readonly location = computed(() => [this.profile().city, this.profile().country].filter(Boolean).join(', '));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const sheet = this.host.nativeElement.querySelector<HTMLElement>('.sheet');
      if (!sheet || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => this.measure(sheet));
      observer.observe(sheet);
      this.measure(sheet);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private measure(sheet: HTMLElement): void {
    const pageHeight = this.portfolio().market.pageFormat === 'LETTER' ? 11 * 96 : 297 * MM;
    const margin = MARGIN_MM * MM;
    const usable = pageHeight - 2 * margin;
    const content = sheet.scrollHeight - 2 * margin;
    this.pagesUsed.set(Math.max(1, Math.ceil(content / usable - 0.02)));
  }

  protected date(iso?: string): string {
    const p = this.portfolio();
    return formatDate(iso, p.market.dateFormat, p.lang);
  }

  protected fullDate(iso?: string): string {
    return formatFullDate(iso, this.portfolio().lang);
  }

  protected period(start?: string, end?: string, current = false): string {
    const p = this.portfolio();
    return formatPeriod(start, end, current, p.market.dateFormat, p.lang, this.ui().present);
  }

  protected skillNames(group: SkillGroupView): string {
    return group.skills.map((s) => s.name).join(', ');
  }

  protected languageLine(section: Section): string {
    return this.languages(section)
      .map((l) => (l.level ? `${l.name} (${l.level})` : (l.name ?? '')))
      .join(', ');
  }

  protected texts(s: Section): string[] {
    return s.items as string[];
  }
  protected experiences(s: Section): ExperienceView[] {
    return s.items as ExperienceView[];
  }
  protected educations(s: Section): EducationView[] {
    return s.items as EducationView[];
  }
  protected projects(s: Section): ProjectView[] {
    return s.items as ProjectView[];
  }
  protected skills(s: Section): SkillGroupView[] {
    return s.items as SkillGroupView[];
  }

  /** Compétences professionnelles puis personnelles ; les titres ne s'affichent que si les deux existent. */
  protected skillSubsections(s: Section): { kind: SkillKind; label: string; groups: SkillGroupView[]; showTitle: boolean }[] {
    const groups = this.skills(s);
    const kinds: SkillKind[] = ['PROFESSIONAL', 'PERSONAL'];
    const subsections = kinds
      .map((kind) => ({
        kind,
        label: kind === 'PROFESSIONAL' ? this.ui().skillsPro : this.ui().skillsPersonal,
        groups: groups.filter((g) => (g.kind ?? 'PROFESSIONAL') === kind),
        showTitle: false,
      }))
      .filter((sub) => sub.groups.length);
    return subsections.map((sub) => ({ ...sub, showTitle: subsections.length > 1 }));
  }
  protected certifications(s: Section): CertificationView[] {
    return s.items as CertificationView[];
  }
  protected languages(s: Section): LanguageView[] {
    return s.items as LanguageView[];
  }
  protected customItems(s: Section): CustomItemView[] {
    return s.items as CustomItemView[];
  }
}