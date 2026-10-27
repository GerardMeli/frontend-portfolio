import { Injectable, computed, effect, signal } from '@angular/core';
import { readStorage, writeStorage } from './util';

export type ThemeMode = 'light' | 'dark' | 'auto';
const ORDER: ThemeMode[] = ['dark', 'light', 'auto'];
const KEY = 'portfolio.theme';

/** Thème clair, sombre ou automatique (suit le système). Appliqué via data-theme sur <html>. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.initial());

  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.media.matches);

  readonly resolved = computed(() => (this.mode() === 'auto' ? (this.systemDark() ? 'dark' : 'light') : this.mode()));

  constructor() {
    this.media.addEventListener('change', (event) => this.systemDark.set(event.matches));
    effect(() => {
      document.documentElement.dataset['theme'] = this.resolved();
    });
  }

  cycle(): void {
    const next = ORDER[(ORDER.indexOf(this.mode()) + 1) % ORDER.length];
    this.mode.set(next);
    writeStorage(KEY, next);
  }

  private initial(): ThemeMode {
    const saved = readStorage(KEY);
    return ORDER.includes(saved as ThemeMode) ? (saved as ThemeMode) : 'dark';
  }
}