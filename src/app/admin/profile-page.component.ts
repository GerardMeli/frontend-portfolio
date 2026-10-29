import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { mediaUrl } from '../core/util';
import { AdminApiService, Problem, Rec, problemOf } from './admin-api.service';
import { FieldEditorComponent } from './field-editor.component';
import { PROFILE_FIELDS } from '../core/resources';

/** Profil unique : créé à la première sauvegarde, modifié ensuite. */
@Component({
  selector: 'app-profile-page',
  imports: [FieldEditorComponent],
  template: `
    <header class="adm__head">
      <h1>Profil</h1>
      <p>Identité, coordonnées et résumé. Les champs en deux langues sont traduits sur le site.</p>
    </header>

    <section class="card photo-box">
      <div class="photo-box__preview">
        @if (preview(); as src) {
          <img [src]="src" alt="Photo de profil" />
        } @else {
          <span>Aucune photo</span>
        }
      </div>
      <div>
        <h2 class="ed__title">Photo de profil</h2>
        <p class="ed__hint">
          JPEG, PNG ou WebP, 2 Mo maximum. Un portrait carré donne le meilleur rendu. Elle remplace le lien saisi plus bas
          et ne s’affiche que sur les marchés où « Afficher la photo » est activé.
        </p>
        <div class="ed__actions">
          <label class="btn btn--grad btn--sm">
            {{ uploading() ? 'Envoi…' : photo() ? 'Changer l’image' : 'Choisir une image' }}
            <input type="file" hidden accept="image/jpeg,image/png,image/webp" [disabled]="uploading()" (change)="onFile($event)" />
          </label>
          @if (photo()) {
            <button type="button" class="btn btn--ghost btn--sm" (click)="removePhoto()">Supprimer</button>
          }
        </div>
        @if (photoProblem(); as message) {
          <p class="alert alert--error" role="alert">{{ message }}</p>
        }
      </div>
    </section>

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

  /** Photo téléversée (URL relative à l'API), ou null. */
  protected readonly photo = signal<string | null>(null);
  protected readonly uploading = signal(false);
  protected readonly photoProblem = signal<string | null>(null);
  /** Aperçu : la photo téléversée, sinon le lien saisi dans le formulaire. */
  protected readonly preview = computed(() => mediaUrl(this.photo() ?? (this.model()['photoUrl'] as string | undefined)));

  constructor() {
    this.api.photo().subscribe({ next: (r) => this.photo.set(r.url), error: () => undefined });
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

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.photoProblem.set('Image trop lourde : 2 Mo maximum.');
      return;
    }
    this.uploading.set(true);
    this.photoProblem.set(null);
    this.api.uploadPhoto(file).subscribe({
      next: (r) => {
        this.photo.set(r.url);
        this.uploading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.uploading.set(false);
        this.photoProblem.set(problemOf(err).message);
      },
    });
  }

  protected removePhoto(): void {
    this.api.deletePhoto().subscribe({
      next: () => this.photo.set(null),
      error: (err: HttpErrorResponse) => this.photoProblem.set(problemOf(err).message),
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