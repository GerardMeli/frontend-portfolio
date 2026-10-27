import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { CollectionConfig, Field } from '../core/resources';
import { FieldEditorComponent } from './field-editor.component';


type Selection = string | number | null;

/**
 * Éditeur générique d'une collection : liste (ordre, visibilité, suppression) et formulaire.
 * Les éléments enfants (tâches, points clés, compétences, éléments de section) s'affichent
 * dans un éditeur imbriqué une fois le parent enregistré.
 */
@Component({
  selector: 'app-resource-editor',
  imports: [FieldEditorComponent],
  template: `
    <div class="ed" [class.ed--child]="isChild()">
      <section class="ed__list card">
        <header class="ed__head">
          <h2 class="ed__title">{{ config().label }}</h2>
          <button type="button" class="btn btn--grad btn--sm" (click)="startNew()">Ajouter</button>
        </header>

        @if (loading()) {
          <p class="ed__empty">Chargement…</p>
        } @else if (!items().length) {
          <p class="ed__empty">Aucun élément pour l’instant. Ajoutez le premier.</p>
        }

        <ul class="rows">
          @for (item of items(); track item[idKey()]; let first = $first, last = $last, index = $index) {
            <li class="row" [class.is-active]="selected() === item[idKey()]" [class.is-hidden]="config().hasVisible && item['visible'] === false">
              <button type="button" class="row__main" (click)="select(item)">
                <strong>{{ titleOf(item) || '(sans titre)' }}</strong>
                @if (subtitleOf(item)) {
                  <span>{{ subtitleOf(item) }}</span>
                }
                @if (marketsOf(item).length) {
                  <span class="row__tags">
                    @for (m of marketsOf(item); track m) {
                      <i>{{ m }}</i>
                    }
                  </span>
                }
              </button>
              <div class="row__tools">
                @if (config().hasVisible) {
                  <button type="button" class="chip chip--btn" (click)="toggleVisible(item)" [title]="item['visible'] === false ? 'Afficher sur le site' : 'Masquer du site'">
                    {{ item['visible'] === false ? 'Masqué' : 'Visible' }}
                  </button>
                }
                @if (config().reorder) {
                  <button type="button" class="icon-btn icon-btn--sm" [disabled]="first" (click)="move(index, -1)" aria-label="Monter">↑</button>
                  <button type="button" class="icon-btn icon-btn--sm" [disabled]="last" (click)="move(index, 1)" aria-label="Descendre">↓</button>
                }
                @if (confirming() === item[idKey()]) {
                  <button type="button" class="btn btn--danger btn--sm" (click)="remove(item)">Confirmer</button>
                  <button type="button" class="btn btn--ghost btn--sm" (click)="confirming.set(null)">Annuler</button>
                } @else {
                  <button type="button" class="icon-btn icon-btn--sm icon-btn--danger" (click)="confirming.set(item[idKey()])" aria-label="Supprimer">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
                  </button>
                }
              </div>
            </li>
          }
        </ul>
      </section>

      <section class="ed__form card">
        @if (selected() === null) {
          <p class="ed__empty">Sélectionnez un élément dans la liste, ou ajoutez-en un.</p>
        } @else {
          <h3 class="ed__subtitle">{{ isNew() ? 'Nouveau : ' + config().singular.toLowerCase() : config().singular }}</h3>
          <app-field-editor [fields]="config().fields" [model]="model()" [locked]="!isNew()" (changed)="onChange($event)" />

          @if (problem(); as p) {
            <div class="alert alert--error" role="alert">
              <strong>{{ p.message }}</strong>
              @if (p.details.length) {
                <ul>
                  @for (d of p.details; track $index) {
                    <li>{{ d }}</li>
                  }
                </ul>
              }
            </div>
          }
          @if (saved()) {
            <p class="alert alert--ok" role="status">Enregistré.</p>
          }

          <div class="ed__actions">
            <button type="button" class="btn btn--grad" [disabled]="saving()" (click)="save()">{{ saving() ? 'Enregistrement…' : 'Enregistrer' }}</button>
            <button type="button" class="btn btn--ghost" (click)="close()">Fermer</button>
          </div>

          @if (config().child; as child) {
            @if (isNew()) {
              <p class="ed__hint">Enregistrez d’abord pour ajouter : {{ child.label.toLowerCase() }}.</p>
            } @else {
              <div class="ed__child">
                <app-resource-editor [path]="path() + '/' + selected() + '/' + child.segment" [config]="child" />
              </div>
            }
          }
        }
      </section>
    </div>
  `,
})
export class ResourceEditorComponent {
  private readonly api = inject(AdminApiService);

  /** Chemin de la collection : "/experiences" ou "/experiences/3/tasks". */
  readonly path = input.required<string>();
  readonly config = input.required<CollectionConfig>();

  protected readonly items = signal<Rec[]>([]);
  protected readonly loading = signal(false);
  protected readonly selected = signal<Selection>(null);
  protected readonly model = signal<Rec>({});
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly problem = signal<Problem | null>(null);
  protected readonly confirming = signal<unknown>(null);

  protected readonly idKey = computed(() => this.config().idKey ?? 'id');
  protected readonly isNew = computed(() => this.selected() === 'new');
  protected readonly isChild = computed(() => this.path().split('/').length > 2);

  constructor() {
    // Recharge la liste quand le chemin change (ex. autre parent sélectionné).
    effect(() => {
      this.path();
      untracked(() => {
        this.selected.set(null);
        this.problem.set(null);
        this.confirming.set(null);
        this.load();
      });
    });
  }

  protected titleOf(item: Rec): string {
    return this.config().title(item);
  }

  protected subtitleOf(item: Rec): string {
    return this.config().subtitle?.(item) ?? '';
  }

  protected marketsOf(item: Rec): string[] {
    const m = item['markets'];
    return Array.isArray(m) ? (m as string[]) : [];
  }

  private load(): void {
    this.loading.set(true);
    this.api.list(this.path()).subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.problem.set(problemOf(err));
      },
    });
  }

  protected select(item: Rec): void {
    this.selected.set(item[this.idKey()] as Selection);
    this.model.set(structuredClone(item));
    this.problem.set(null);
    this.saved.set(false);
  }

  protected startNew(): void {
    this.selected.set('new');
    this.model.set({ ...(this.config().defaults ?? {}) });
    this.problem.set(null);
    this.saved.set(false);
  }

  protected close(): void {
    this.selected.set(null);
  }

  protected onChange(next: Rec): void {
    this.model.set(next);
    this.saved.set(false);
  }

  protected save(): void {
    const errors = this.validate(this.model());
    if (errors.length) {
      this.problem.set({ message: 'Formulaire incomplet', details: errors });
      return;
    }
    this.saving.set(true);
    this.problem.set(null);

    const body = this.payload(this.model());
    const id = this.selected();
    const request = this.isNew() ? this.api.create(this.path(), body) : this.api.update(this.path(), id, body);
    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.saved.set(true);
        this.upsert(saved);
        this.selected.set(saved[this.idKey()] as Selection);
        this.model.set(structuredClone(saved));
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.problem.set(problemOf(err));
      },
    });
  }

  protected toggleVisible(item: Rec): void {
    const body = { ...this.payload(item), visible: item['visible'] === false };
    this.api.update(this.path(), item[this.idKey()], body).subscribe({
      next: (saved) => {
        this.upsert(saved);
        if (this.selected() === saved[this.idKey()]) this.model.set(structuredClone(saved));
      },
      error: (err: HttpErrorResponse) => this.problem.set(problemOf(err)),
    });
  }

  protected remove(item: Rec): void {
    const id = item[this.idKey()];
    this.api.remove(this.path(), id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((i) => i[this.idKey()] !== id));
        this.confirming.set(null);
        if (this.selected() === id) this.selected.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.confirming.set(null);
        this.problem.set(problemOf(err));
      },
    });
  }

  protected move(index: number, delta: number): void {
    const list = [...this.items()];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    this.items.set(list);
    this.api.reorder(this.path(), list.map((i) => i[this.idKey()])).subscribe({ error: () => this.load() });
  }

  private upsert(saved: Rec): void {
    const key = this.idKey();
    this.items.update((list) => {
      const at = list.findIndex((i) => i[key] === saved[key]);
      if (at === -1) return [...list, saved];
      const copy = [...list];
      copy[at] = saved;
      return copy;
    });
  }

  private validate(model: Rec): string[] {
    const errors: string[] = [];
    for (const f of this.config().fields.filter((field) => field.required)) {
      if (!this.filled(f, model[f.key])) {
        errors.push(f.type === 'i18n' || f.type === 'i18n-area' ? `${f.label} : renseignez au moins une langue` : `${f.label} : obligatoire`);
      }
    }
    return errors;
  }

  private filled(f: Field, value: unknown): boolean {
    if (f.type === 'i18n' || f.type === 'i18n-area') {
      return Object.values((value as Record<string, string> | null) ?? {}).some((t) => t.trim() !== '');
    }
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  /** Corps envoyé au backend : seulement les champs du formulaire, sans valeurs vides. */
  private payload(model: Rec): Rec {
    const body: Rec = {};
    for (const f of this.config().fields) {
      const value = model[f.key];
      switch (f.type) {
        case 'checkbox':
          body[f.key] = f.key === 'visible' ? value !== false : value === true;
          break;
        case 'i18n':
        case 'i18n-area': {
          const entries = Object.entries((value as Record<string, string> | null) ?? {})
            .map(([lang, t]) => [lang, t.trim()] as const)
            .filter(([, t]) => t !== '');
          body[f.key] = entries.length ? Object.fromEntries(entries) : null;
          break;
        }
        case 'markets':
          body[f.key] = Array.isArray(value) && value.length ? value : null;
          break;
        case 'tags':
          body[f.key] = Array.isArray(value) ? value : [];
          break;
        case 'number':
        case 'select':
          body[f.key] = value === '' || value === undefined ? null : value;
          break;
        default: {
          const t = typeof value === 'string' ? value.trim() : value;
          body[f.key] = t === '' || t === undefined ? null : t;
        }
      }
    }
    return body;
  }
}
