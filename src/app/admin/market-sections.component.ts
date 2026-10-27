import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Rec } from '../core/resources';
import { AdminApiService, Problem, problemOf } from './admin-api.service';

interface Row {
  sectionType: string;
  visible: boolean;
  maxItems: number | null;
}

const LABELS: Record<string, string> = {
  SUMMARY: 'Résumé',
  EXPERIENCE: 'Expériences',
  EDUCATION: 'Formations',
  PROJECT: 'Projets',
  SKILL: 'Compétences',
  PERSONAL_SKILL: 'Compétences personnelles',
  PROFESSIONAL_SKILL: 'Compétences professionnelles',
  CERTIFICATION: 'Certifications',
  LANGUAGE: 'Langues',
};

/** Ordre, visibilité et plafond d'éléments des sections pour un marché. */
@Component({
  selector: 'app-market-sections',
  template: `
    <section class="card ed__form">
      <header class="ed__head">
        <h2 class="ed__title">Sections par marché</h2>
        <select class="input input--auto" (change)="pick($any($event.target).value)" aria-label="Marché">
          @for (m of markets(); track m['code']) {
            <option [value]="m['code']" [selected]="m['code'] === code()">{{ m['label'] }}</option>
          }
        </select>
      </header>
      <p class="ed__hint">Réordonnez les sections, masquez celles qui ne conviennent pas à ce marché et limitez le nombre d’éléments affichés.</p>

      <ul class="rows">
        @for (row of rows(); track row.sectionType; let first = $first, last = $last, index = $index) {
          <li class="row row--section" [class.is-hidden]="!row.visible">
            <div class="row__main row__main--static">
              <strong>{{ label(row.sectionType) }}</strong>
            </div>
            <div class="row__tools">
              <label class="mini">
                <span>Max</span>
                <input class="input input--mini" type="number" min="1" [value]="row.maxItems ?? ''" (input)="setMax(index, $any($event.target).value)" placeholder="tous" />
              </label>
              <button type="button" class="chip chip--btn" (click)="toggle(index)">{{ row.visible ? 'Visible' : 'Masquée' }}</button>
              <button type="button" class="icon-btn icon-btn--sm" [disabled]="first" (click)="move(index, -1)" aria-label="Monter">↑</button>
              <button type="button" class="icon-btn icon-btn--sm" [disabled]="last" (click)="move(index, 1)" aria-label="Descendre">↓</button>
            </div>
          </li>
        }
      </ul>

      @if (problem(); as p) {
        <div class="alert alert--error" role="alert">
          <strong>{{ p.message }}</strong>
        </div>
      }
      @if (saved()) {
        <p class="alert alert--ok" role="status">Sections enregistrées pour ce marché.</p>
      }
      <div class="ed__actions">
        <button type="button" class="btn btn--grad" [disabled]="saving() || !code()" (click)="save()">{{ saving() ? 'Enregistrement…' : 'Enregistrer l’ordre' }}</button>
      </div>
    </section>
  `,
})
export class MarketSectionsComponent {
  private readonly api = inject(AdminApiService);

  protected readonly markets = signal<Rec[]>([]);
  protected readonly code = signal<string | null>(null);
  protected readonly rows = signal<Row[]>([]);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly problem = signal<Problem | null>(null);

  constructor() {
    this.api.list('/markets').subscribe({
      next: (markets) => {
        this.markets.set(markets);
        if (markets.length) this.pick(String(markets[0]['code']));
      },
      error: (err: HttpErrorResponse) => this.problem.set(problemOf(err)),
    });
  }

  protected label(type: string): string {
    return LABELS[type] ?? type;
  }

  protected pick(code: string): void {
    this.code.set(code);
    this.saved.set(false);
    this.problem.set(null);
    this.api.list(`/markets/${code}/sections`).subscribe({
      next: (sections) =>
        this.rows.set(
          sections.map((s) => ({
            sectionType: String(s['sectionType']),
            visible: s['visible'] !== false,
            maxItems: typeof s['maxItems'] === 'number' ? (s['maxItems'] as number) : null,
          })),
        ),
      error: (err: HttpErrorResponse) => this.problem.set(problemOf(err)),
    });
  }

  protected toggle(index: number): void {
    this.update(index, (row) => ({ ...row, visible: !row.visible }));
  }

  protected setMax(index: number, raw: string): void {
    const value = raw === '' ? null : Math.max(1, Math.floor(Number(raw)));
    this.update(index, (row) => ({ ...row, maxItems: value }));
  }

  protected move(index: number, delta: number): void {
    const list = [...this.rows()];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    this.rows.set(list);
    this.saved.set(false);
  }

  protected save(): void {
    const code = this.code();
    if (!code) return;
    this.saving.set(true);
    this.problem.set(null);
    const body = this.rows().map((row, i) => ({
      sectionType: row.sectionType,
      sortOrder: i + 1,
      visible: row.visible,
      maxItems: row.maxItems,
    }));
    this.api.put<Rec[]>(`/markets/${code}/sections`, body).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.problem.set(problemOf(err));
      },
    });
  }

  private update(index: number, change: (row: Row) => Row): void {
    this.rows.update((list) => list.map((row, i) => (i === index ? change(row) : row)));
    this.saved.set(false);
  }
}
