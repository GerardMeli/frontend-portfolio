import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Observable, Subject, catchError, switchMap, tap } from 'rxjs';
import { API_URL } from './config';
import { textsFor } from './i18n';
import { ApiProblem, MarketInfo, Portfolio } from './models';
import { readStorage, writeStorage } from './util';

interface Request {
  market: string | null;
  lang: string | null;
}

/**
 * État partagé du portfolio : marché et langue choisis par le visiteur, données du CV.
 * Chaque changement de marché ou de langue relance un appel à /api/public/portfolio.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly http = inject(HttpClient);
  private readonly requests = new Subject<Request>();
  private started = false;
  private slowTimer?: ReturnType<typeof setTimeout>;

  readonly markets = signal<MarketInfo[]>([]);
  readonly portfolio = signal<Portfolio | null>(null);
  readonly loading = signal(true);
  /** Vrai si la réponse tarde (serveur gratuit en veille). */
  readonly slow = signal(false);
  readonly error = signal<ApiProblem | null>(null);

  private readonly chosenMarket = signal<string | null>(null);
  private readonly chosenLang = signal<string | null>(null);

  readonly ui = computed(() => textsFor(this.portfolio()?.lang ?? this.chosenLang()));
  /** Paramètres d'URL à conserver quand on navigue entre les pages. */
  readonly queryParams = computed(() => {
    const p = this.portfolio();
    return p ? { market: p.market.code, lang: p.lang } : {};
  });

  /** À appeler une fois au démarrage de l'application. */
  start(): void {
    if (this.started) return;
    this.started = true;

    const params = new URLSearchParams(window.location.search);
    this.chosenMarket.set(params.get('market') ?? readStorage('portfolio.market'));
    this.chosenLang.set(params.get('lang') ?? readStorage('portfolio.lang'));

    this.requests.pipe(switchMap((request) => this.fetch(request))).subscribe();
    this.http.get<MarketInfo[]>(`${API_URL}/public/markets`).subscribe({
      next: (markets) => this.markets.set(markets),
      error: () => undefined,
    });
    this.reload();
  }

  setMarket(code: string): void {
    if (code === this.portfolio()?.market.code) return;
    this.chosenMarket.set(code);
    writeStorage('portfolio.market', code);
    // Un changement de marché reprend la langue par défaut de ce marché, sauf choix explicite de langue.
    this.reload();
  }

  setLang(lang: string): void {
    if (lang === this.portfolio()?.lang) return;
    this.chosenLang.set(lang);
    writeStorage('portfolio.lang', lang);
    this.reload();
  }

  reload(): void {
    this.requests.next({ market: this.chosenMarket(), lang: this.chosenLang() });
  }

  private fetch(request: Request): Observable<unknown> {
    this.loading.set(true);
    this.error.set(null);
    this.armSlowTimer();

    let params = new HttpParams();
    if (request.market) params = params.set('market', request.market);
    if (request.lang) params = params.set('lang', request.lang);

    return this.http.get<Portfolio>(`${API_URL}/public/portfolio`, { params }).pipe(
      tap((portfolio) => {
        this.portfolio.set(portfolio);
        this.chosenMarket.set(portfolio.market.code);
        this.loading.set(false);
        this.clearSlowTimer();
        this.syncUrl(portfolio);
      }),
      catchError((err: HttpErrorResponse) => {
        this.clearSlowTimer();
        // Marché mémorisé devenu inconnu : on repart sans marché (le backend choisit le défaut).
        if (err.status === 404 && request.market && !this.portfolio()) {
          this.chosenMarket.set(null);
          writeStorage('portfolio.market', null);
          queueMicrotask(() => this.reload());
          return EMPTY;
        }
        this.loading.set(false);
        this.error.set({
          offline: err.status === 0,
          message: typeof err.error?.message === 'string' ? err.error.message : err.message,
        });
        return EMPTY;
      }),
    );
  }

  private syncUrl(portfolio: Portfolio): void {
    const url = new URL(window.location.href);
    url.searchParams.set('market', portfolio.market.code);
    url.searchParams.set('lang', portfolio.lang);
    history.replaceState(history.state, '', url);
  }

  private armSlowTimer(): void {
    this.clearSlowTimer();
    this.slow.set(false);
    this.slowTimer = setTimeout(() => this.slow.set(true), 4000);
  }

  private clearSlowTimer(): void {
    clearTimeout(this.slowTimer);
    this.slow.set(false);
  }
}