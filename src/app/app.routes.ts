import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guard';

const resource = (key: string) => ({
  path: key,
  data: { resource: key },
  loadComponent: () => import('./admin/resource-page.component').then((m) => m.ResourcePageComponent),
});

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'cv',
    loadComponent: () => import('./pages/cv/cv-page.component').then((m) => m.CvPageComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      {
        path: 'profile',
        loadComponent: () => import('./admin/profile-page.component').then((m) => m.ProfilePageComponent),
      },
      resource('experiences'),
      resource('educations'),
      resource('projects'),
      resource('skills'),
      resource('certifications'),
      resource('languages'),
      resource('custom-sections'),
      {
        path: 'markets',
        loadComponent: () => import('./admin/markets-page.component').then((m) => m.MarketsPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];