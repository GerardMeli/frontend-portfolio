import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { API_URL } from '../config';
import { readStorage, writeStorage } from '../util';

interface Session {
  token: string;
  expiresAt: number;
}

interface TokenResponse {
  token: string;
  expiresInMinutes: number;
}

const KEY = 'portfolio.session';

/** Connexion de l'administrateur avec renouvellement du JWT par cookie HttpOnly. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<Session | null>(this.restore());
  private refreshRequest: Observable<TokenResponse> | null = null;

  readonly isLoggedIn = computed(() => {
    const s = this.session();
    return !!s && s.expiresAt > Date.now();
  });

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${API_URL}/auth/login`, { email, password }, { withCredentials: true }).pipe(
      tap((response) => {
        this.store(response);
      }),
    );
  }

  refresh(): Observable<TokenResponse> {
    if (!this.refreshRequest) {
      const request = this.http.post<TokenResponse>(`${API_URL}/auth/refresh`, null, { withCredentials: true }).pipe(
        tap((response) => this.store(response)),
        finalize(() => {
          if (this.refreshRequest === request) this.refreshRequest = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.refreshRequest = request;
    }
    return this.refreshRequest;
  }

  ensureSession(): Observable<boolean> {
    if (this.token()) return of(true);
    return this.refresh().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  token(): string | null {
    const s = this.session();
    return s && s.expiresAt > Date.now() ? s.token : null;
  }

  logout(): void {
    this.clearSession();
    this.http.post<void>(`${API_URL}/auth/logout`, null, { withCredentials: true }).subscribe({
      error: (error: unknown) => console.error('Impossible de révoquer le refresh token.', error),
    });
    void this.router.navigate(['/admin/login']);
  }

  expire(): void {
    this.clearSession();
    void this.router.navigate(['/admin/login']);
  }

  private store(response: TokenResponse): void {
    const session = { token: response.token, expiresAt: Date.now() + response.expiresInMinutes * 60_000 };
    this.session.set(session);
    writeStorage(KEY, JSON.stringify(session));
  }

  private clearSession(): void {
    this.session.set(null);
    writeStorage(KEY, null);
  }

  private restore(): Session | null {
    try {
      const raw = readStorage(KEY);
      const parsed = raw ? (JSON.parse(raw) as Session) : null;
      return parsed && typeof parsed.token === 'string' && typeof parsed.expiresAt === 'number' ? parsed : null;
    } catch {
      return null;
    }
  }
}