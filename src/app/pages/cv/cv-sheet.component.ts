import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
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
import { formatDate, formatFullDate, formatPeriod, mediaUrl, prettyUrl } from '../../core/util';

const MM = 96 / 25.4; // pixels par millimètre
export const CV_MARGIN_V_MM = 12;
export const CV_MARGIN_H_MM = 14;
/** Niveaux de compactage : 0 = confortable, 3 = très serré (taille du texte et espacements réduits). */
const MAX_DENSITY = 3;
/** Pour simplement gagner une page, on ne resserre pas au-delà de ce niveau (texte encore bien lisible). */
const SAVE_MAX_DENSITY = 2;
/** Dernière page remplie à moins de 15 % : on essaie de la rattraper en resserrant. */
const SAVE_THRESHOLD = 0.15;

/**
 * Feuille de CV au format du marché (A4 ou Letter), prête à imprimer.
 * Une seule colonne (lisible par les logiciels de recrutement), mise en page dense et sobre.
 * Si le contenu dépasse le nombre de pages du marché, le texte est resserré automatiquement.
 */
@Component({
  selector: 'app-cv-sheet',
  template: `
    <article class="sheet" [class.sheet--letter]="portfolio().market.pageFormat === 'LETTER'" [attr.data-density]="density()">
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
          @if (extras().length) {
            <ul class="sheet__contact sheet__contact--dim">
              @for (line of extras(); track $index) { <li>{{ line }}</li> }
            </ul>
          }
        </div>
        @if (photo(); as src) {
          <img class="sheet__photo" [src]="src" [alt]="profile().fullName" />
        }
      </header>

      @for (section of portfolio().sections; track section.type) {
        <section class="sheet__sec">
          <h2>{{ section.title }}</h2>
          @switch (section.type) {
            @case ('SUMMARY') {
              @for (text of texts(section); track $index) {
                <p class="sheet__text">{{ text }}</p>
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
                  @if (e.description) { <p class="sheet__text">{{ e.description }}</p> }
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
                  @if (e.description) { <p class="sheet__text">{{ e.description }}</p> }
                </div>
              }
            }
            @case ('PROJECT') {
              @for (p of projects(section); track $index) {
                <div class="sheet__item">
                  <div class="sheet__row">
                    <span><strong>{{ p.name }}</strong>@if (p.techStack.length) { <span class="sheet__tech">{{ p.techStack.join(', ') }}</span> }</span>
                    <span class="sheet__when">{{ period(p.startDate, p.endDate, false) }}</span>
                  </div>
                  @if (p.description) { <p class="sheet__text">{{ p.description }}</p> }
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
                  <div class="sheet__skill">
                    <strong class="sheet__skill-name">{{ g.name }}</strong>
                    <span>{{ skillNames(g) }}</span>
                  </div>
                }
              }
            }
            @case ('CERTIFICATION') {
              <div class="sheet__certs">
                @for (c of certifications(section); track $index) {
                  <p class="sheet__cert">
                    <strong>{{ c.name }}</strong>{{ c.issuer ? ', ' + c.issuer : '' }}
                    @if (date(c.issuedOn); as when) { <span class="sheet__when">{{ when }}</span> }
                  </p>
                }
              </div>
            }
            @case ('LANGUAGE') {
              <p class="sheet__text">{{ languageLine(section) }}</p>
            }
            @default {
              @for (i of customItems(section); track $index) {
                <div class="sheet__item">
                  <div class="sheet__row">
                    <strong>{{ i.title }}</strong>
                    <span class="sheet__when">{{ period(i.startDate, i.endDate, false) }}</span>
                  </div>
                  @if (i.subtitle) { <p class="sheet__sub">{{ i.subtitle }}</p> }
                  @if (i.description) { <p class="sheet__text">{{ i.description }}</p> }
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
  /** Niveau de compactage appliqué automatiquement (0 = aucun). */
  readonly density = signal(0);

  private trying = false; // essai de gain d'une page en cours
  private locked = false; // essai déjà fait pour ce contenu
  private baseDensity = 0;
  private basePages = 1;

  protected readonly ui = this.svc.ui;
  protected readonly pretty = prettyUrl;
  protected readonly profile = computed(() => this.portfolio().profile);
  protected readonly photo = computed(() =>
    this.portfolio().market.showPhoto ? mediaUrl(this.profile().photoUrl) : undefined,
  );
  protected readonly location = computed(() => [this.profile().city, this.profile().country].filter(Boolean).join(', '));

  /** Infos personnelles (selon le marché) et autorisation de travail. */
  protected readonly extras = computed(() => {
    const p = this.profile();
    const lines: string[] = [];
    if (this.portfolio().market.showPersonalDetails) {
      if (p.birthDate) lines.push(this.ui().born(formatFullDate(p.birthDate, this.portfolio().lang)));
      if (p.nationality) lines.push(p.nationality);
      if (p.maritalStatus) lines.push(p.maritalStatus);
    }
    if (p.workAuthorization) lines.push(p.workAuthorization);
    return lines;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Nouveau marché ou nouvelle langue : on repart de la mise en page confortable.
    effect(() => {
      this.portfolio();
      untracked(() => {
        this.trying = false;
        this.locked = false;
        this.density.set(0);
      });
    });

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
    const market = this.portfolio().market;
    const pageHeight = market.pageFormat === 'LETTER' ? 11 * 96 : 297 * MM;
    const margin = CV_MARGIN_V_MM * MM;
    const usable = pageHeight - 2 * margin;
    const content = sheet.scrollHeight - 2 * margin;
    const fill = content / usable;
    const pages = Math.max(1, Math.ceil(fill - 0.02));
    this.pagesUsed.set(pages);
    const density = this.density();

    // 1. Trop long pour ce marché : on resserre d'un cran (la mesure se relance toute seule).
    if (pages > market.maxPages && density < MAX_DENSITY) {
      this.density.set(density + 1);
      return;
    }

    // 2. Essai pour gagner une page quand la dernière est presque vide.
    if (this.trying) {
      if (pages < this.basePages) {
        this.trying = false; // gagné
      } else if (density < SAVE_MAX_DENSITY) {
        this.density.set(density + 1);
      } else {
        // Pas de gain : on revient à la mise en page confortable.
        this.trying = false;
        this.locked = true;
        this.density.set(this.baseDensity);
      }
      return;
    }
    if (!this.locked && pages > 1 && fill - (pages - 1) <= SAVE_THRESHOLD && density < SAVE_MAX_DENSITY) {
      this.trying = true;
      this.baseDensity = density;
      this.basePages = pages;
      this.density.set(density + 1);
    }
  }

  protected date(iso?: string): string {
    const p = this.portfolio();
    return formatDate(iso, p.market.dateFormat, p.lang);
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