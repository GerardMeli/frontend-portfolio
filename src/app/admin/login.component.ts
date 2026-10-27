import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/service';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  template: `
    <div class="login">
      <form class="login__card card" (submit)="submit($event, email.value, password.value)">
        <h1 class="login__title">Connexion</h1>
        <p class="login__text">Espace réservé à l’administration du portfolio.</p>

        <label class="field__label" for="email">E-mail</label>
        <input #email id="email" class="input" type="email" autocomplete="username" required />

        <label class="field__label" for="password">Mot de passe</label>
        <input #password id="password" class="input" type="password" autocomplete="current-password" required />

        @if (error(); as message) {
          <p class="alert alert--error" role="alert">{{ message }}</p>
        }

        <button type="submit" class="btn btn--grad" [disabled]="busy()">{{ busy() ? 'Connexion…' : 'Se connecter' }}</button>
        <a class="login__back" routerLink="/">Retour au site</a>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    if (this.auth.isLoggedIn()) void this.router.navigate(['/admin']);
  }

  protected submit(event: Event, email: string, password: string): void {
    event.preventDefault();
    this.busy.set(true);
    this.error.set(null);
    this.auth.login(email.trim(), password).subscribe({
      next: () => void this.router.navigate(['/admin']),
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(
          err.status === 0
            ? 'Le serveur ne répond pas.'
            : err.status === 401
              ? 'E-mail ou mot de passe incorrect.'
              : (err.error?.message ?? 'Connexion impossible.'),
        );
      },
    });
  }
}
