import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FieldEditorComponent } from './field-editor.component';;

/** Profil unique : créé à la première sauvegarde, modifié ensuite. */
@Component({
  selector: 'app-profile-page',
  imports: [FieldEditorComponent],
  template: `
    <header class="adm__head">
      <h1>Profil</h1>
      <p>Identité, coordonnées et résumé. Les champs en deux langues sont traduits sur le site.</p>
    </header>

    <section class="card ed__form">
      @if (loading()) {
        <p class="ed__empty">Chargement…</p>
      } @else {
        <app-field-editor [fields]="fields" [model]="model()" (changed)="onChange($event)" />

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
          <p class="alert alert--ok" role="status">Profil enregistré.</p>
        }
        <div class="ed__actions">
          <button type="button" class="btn btn--grad" [disabled]="saving()" (click)="save()">{{ saving() ? 'Enregistrement…' : 'Enregistrer' }}</button>
        </div>
      }
    </section>
  `,
})
export class ProfilePageComponent {
  private readonly api = inject(AdminApiService);

  protected readonly fields = PROFILE_FIELDS;
  protected readonly model = signal<Rec>({});
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly problem = signal<Problem | null>(null);

  constructor() {
    this.api.get('/profile').subscribe({
      next: (profile) => {
        this.model.set(profile);
        this.loading.set(false);
      },
      // 404 : le profil n'existe pas encore, on part d'un formulaire vide.
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status !== 404) this.problem.set(problemOf(err));
      },
    });
  }

  protected onChange(next: Rec): void {
    this.model.set(next);
    this.saved.set(false);
  }

  protected save(): void {
    const model = this.model();
    if (!String(model['fullName'] ?? '').trim()) {
      this.problem.set({ message: 'Formulaire incomplet', details: ['Nom complet : obligatoire'] });
      return;
    }
    this.saving.set(true);
    this.problem.set(null);

    const body: Rec = {};
    for (const f of this.fields) {
      const value = model[f.key];
      if (f.type === 'i18n' || f.type === 'i18n-area') {
        const entries = Object.entries((value as Record<string, string> | null) ?? {}).filter(([, t]) => t.trim() !== '');
        body[f.key] = entries.length ? Object.fromEntries(entries.map(([l, t]) => [l, t.trim()])) : null;
      } else {
        const t = typeof value === 'string' ? value.trim() : value;
        body[f.key] = t === '' || t === undefined ? null : t;
      }
    }

    this.api.put<Rec>('/profile', body).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.saved.set(true);
        this.model.set(saved);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.problem.set(problemOf(err));
      },
    });
  }
}
