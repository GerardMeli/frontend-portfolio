import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/config';

export type Rec = Record<string, unknown>;

export interface Problem {
  message: string;
  details: string[];
}

/** Transforme une erreur HTTP en message lisible (format ErrorResponse du backend). */
export function problemOf(error: HttpErrorResponse): Problem {
  if (error.status === 0) return { message: 'Le serveur ne répond pas.', details: [] };
  const body = error.error as { message?: string; details?: string[] } | null;
  return { message: body?.message ?? error.message, details: body?.details ?? [] };
}

/** Appels génériques vers /api/admin. Les chemins sont relatifs : "/experiences", "/experiences/3/tasks". */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/admin`;

  list(path: string): Observable<Rec[]> {
    return this.http.get<Rec[]>(this.base + path);
  }

  get(path: string): Observable<Rec> {
    return this.http.get<Rec>(this.base + path);
  }

  create(path: string, body: Rec): Observable<Rec> {
    return this.http.post<Rec>(this.base + path, body);
  }

  update(path: string, id: unknown, body: Rec): Observable<Rec> {
    return this.http.put<Rec>(`${this.base}${path}/${id}`, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.base + path, body);
  }

  remove(path: string, id: unknown): Observable<void> {
    return this.http.delete<void>(`${this.base}${path}/${id}`);
  }

  /** URL (relative à l'API) de la photo téléversée, ou null. */
  photo(): Observable<{ url: string | null }> {
    return this.http.get<{ url: string | null }>(`${this.base}/profile/photo`);
  }

  uploadPhoto(file: File): Observable<{ url: string | null }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string | null }>(`${this.base}/profile/photo`, form);
  }

  deletePhoto(): Observable<void> {
    return this.http.delete<void>(`${this.base}/profile/photo`);
  }

  reorder(path: string, ids: unknown[]): Observable<void> {
    return this.http.patch<void>(`${this.base}${path}/reorder`, { ids });
  }
}