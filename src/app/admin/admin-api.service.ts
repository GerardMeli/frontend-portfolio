import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/config';
import { Rec } from '../core/resources';

export interface Problem {
  message: string;
  details: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/admin`;

  list(path: string): Observable<Rec[]> {
    return this.http.get<Rec[]>(this.url(path));
  }

  get(path: string): Observable<Rec> {
    return this.http.get<Rec>(this.url(path));
  }

  create(path: string, body: Rec): Observable<Rec> {
    return this.http.post<Rec>(this.url(path), body);
  }

  update(path: string, id: unknown, body: Rec): Observable<Rec> {
    return this.http.put<Rec>(this.url(`${path}/${encodeURIComponent(String(id))}`), body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.url(path), body);
  }

  remove(path: string, id: unknown): Observable<void> {
    return this.http.delete<void>(this.url(`${path}/${encodeURIComponent(String(id))}`));
  }

  reorder(path: string, ids: unknown[]): Observable<void> {
    return this.http.put<void>(this.url(`${path}/order`), ids);
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

export function problemOf(error: HttpErrorResponse): Problem {
  const body: unknown = error.error;
  const response = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : null;
  const details = response?.['details'];

  return {
    message:
      typeof response?.['message'] === 'string'
        ? response['message']
        : error.status === 0
          ? 'Impossible de joindre le serveur.'
          : error.message,
    details: Array.isArray(details) ? details.filter((detail): detail is string => typeof detail === 'string') : [],
  };
}
