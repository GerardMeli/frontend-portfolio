import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
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

/** Connexion de l'administrateur : le jeton JWT est gardé dans le navigateur jusqu'à son expiration. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<Session | null>(this.restore());

  readonly isLoggedIn = computed(() => {
    const s = this.session();
    return !!s && s.expiresAt > Date.now();
  });

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap((response) => {
        const session = { token: response.token, expiresAt: Date.now() + response.expiresInMinutes * 60_000 };
        this.session.set(session);
        writeStorage(KEY, JSON.stringify(session));
      }),
    );
  }

  token(): string | null {
    const s = this.session();
    return s && s.expiresAt > Date.now() ? s.token : null;
  }

  logout(): void {
    this.session.set(null);
    writeStorage(KEY, null);
    void this.router.navigate(['/admin/login']);
  }

  private restore(): Session | null {
    try {
      const raw = readStorage(KEY);
      const parsed = raw ? (JSON.parse(raw) as Session) : null;
      return parsed && parsed.expiresAt > Date.now() ? parsed : null;
    } catch {
      return null;
    }
  }
}