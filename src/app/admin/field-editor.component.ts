import { Component, inject, input, output } from '@angular/core';
import { LANGS } from '../core/i18n';
import { PortfolioService } from '../core/portfolio.service';
import { Field } from '../core/resources';

/** Formulaire généré à partir d'une liste de champs (texte, dates, traductions, marchés...). */
@Component({
  selector: 'app-field-editor',
  template: `
    <div class="form">
      @for (f of fields(); track f.key) {
        <div class="field" [class.field--check]="f.type === 'checkbox'">
          @switch (f.type) {
            @case ('i18n') {
              <fieldset class="field__group">
                <legend>{{ f.label }}@if (f.required) { <abbr title="obligatoire">*</abbr> }</legend>
                @for (lang of langs; track lang) {
                  <label class="i18n">
                    <span class="i18n__lang">{{ lang.toUpperCase() }}</span>
                    <input class="input" type="text" [value]="translation(f.key, lang)" (input)="setTranslation(f.key, lang, $any($event.target).value)" />
                  </label>
                }
              </fieldset>
            }
            @case ('i18n-area') {
              <fieldset class="field__group">
                <legend>{{ f.label }}@if (f.required) { <abbr title="obligatoire">*</abbr> }</legend>
                @for (lang of langs; track lang) {
                  <label class="i18n">
                    <span class="i18n__lang">{{ lang.toUpperCase() }}</span>
                    <textarea class="input" rows="3" [value]="translation(f.key, lang)" (input)="setTranslation(f.key, lang, $any($event.target).value)"></textarea>
                  </label>
                }
              </fieldset>
            }
            @case ('textarea') {
              <label class="field__label">{{ f.label }}</label>
              <textarea class="input" rows="3" [value]="str(f.key)" (input)="set(f.key, $any($event.target).value)"></textarea>
            }
            @case ('select') {
              <label class="field__label">{{ f.label }}@if (f.required) { <abbr title="obligatoire">*</abbr> }</label>
              <select class="input" (change)="setSelect(f, $any($event.target).value)">
                <option value="" [selected]="str(f.key) === ''">Non renseigné</option>
                @for (o of f.options; track o.value) {
                  <option [value]="o.value" [selected]="o.value === str(f.key)">{{ o.label }}</option>
                }
              </select>
            }
            @case ('checkbox') {
              <label class="check">
                <input type="checkbox" [checked]="bool(f.key)" (change)="set(f.key, $any($event.target).checked)" />
                <span>{{ f.label }}</span>
              </label>
            }
            @case ('markets') {
              <fieldset class="field__group">
                <legend>{{ f.label }}</legend>
                <div class="pills">
                  <button type="button" class="pill" [class.is-on]="allMarkets(f.key)" [attr.aria-pressed]="allMarkets(f.key)" (click)="set(f.key, null)">Tous</button>
                  @for (m of markets(); track m.code) {
                    <button type="button" class="pill" [class.is-on]="marketOn(f.key, m.code)" [attr.aria-pressed]="marketOn(f.key, m.code)" (click)="toggleMarket(f.key, m.code)">{{ m.label }}</button>
                  }
                </div>
              </fieldset>
            }
            @case ('tags') {
              <label class="field__label">{{ f.label }}</label>
              <input class="input" type="text" [value]="tags(f.key)" (change)="setTags(f.key, $any($event.target).value)" />
            }
            @default {
              <label class="field__label">{{ f.label }}@if (f.required) { <abbr title="obligatoire">*</abbr> }</label>
              <input
                class="input"
                [type]="inputType(f)"
                [value]="str(f.key)"
                [disabled]="locked() && !!f.lockOnEdit"
                (input)="setText(f, $any($event.target).value)"
              />
            }
          }
          @if (f.hint) {
            <small class="field__hint">{{ f.hint }}</small>
          }
        </div>
      }
    </div>
  `,
})
export class FieldEditorComponent {
  readonly fields = input.required<Field[]>();
  readonly model = input.required<Rec>();
  /** Vrai pour un élément déjà créé : les champs « non modifiables » sont verrouillés. */
  readonly locked = input(false);
  readonly changed = output<Rec>();

  protected readonly langs = LANGS;
  protected readonly markets = inject(PortfolioService).markets;

  protected str(key: string): string {
    const v = this.model()[key];
    return v === null || v === undefined ? '' : String(v);
  }

  protected bool(key: string): boolean {
    return this.model()[key] === true;
  }

  protected tags(key: string): string {
    const v = this.model()[key];
    return Array.isArray(v) ? v.join(', ') : '';
  }

  protected translation(key: string, lang: string): string {
    const map = this.model()[key] as Record<string, string> | null | undefined;
    return map?.[lang] ?? '';
  }

  protected inputType(f: Field): string {
    return ['number', 'date', 'url', 'email'].includes(f.type) ? f.type : 'text';
  }

  protected set(key: string, value: unknown): void {
    this.changed.emit({ ...this.model(), [key]: value });
  }

  protected setText(f: Field, raw: string): void {
    if (f.type === 'number') {
      this.set(f.key, raw === '' ? null : Number(raw));
    } else {
      this.set(f.key, f.upper ? raw.toUpperCase() : raw);
    }
  }

  protected setSelect(f: Field, raw: string): void {
    this.set(f.key, raw === '' ? null : f.numeric ? Number(raw) : raw);
  }

  protected setTags(key: string, raw: string): void {
    this.set(
      key,
      raw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    );
  }

  protected setTranslation(key: string, lang: string, value: string): void {
    const current = (this.model()[key] as Record<string, string> | null | undefined) ?? {};
    this.set(key, { ...current, [lang]: value });
  }

  protected allMarkets(key: string): boolean {
    const v = this.model()[key];
    return !Array.isArray(v) || v.length === 0;
  }

  protected marketOn(key: string, code: string): boolean {
    const v = this.model()[key];
    return Array.isArray(v) && v.includes(code);
  }

  protected toggleMarket(key: string, code: string): void {
    const current = Array.isArray(this.model()[key]) ? (this.model()[key] as string[]) : [];
    const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code];
    this.set(key, next.length ? next : null);
  }
}
