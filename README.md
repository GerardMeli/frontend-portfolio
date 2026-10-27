# Frontend Portfolio (Angular + SCSS)

Site public du portfolio : le visiteur choisit son marché (Afrique, Canada, Europe) et le CV change de format de page, de dates, de photo, d'infos personnelles et d'ordre des sections. Le CV est aussi imprimable en PDF au format du marché (A4 ou Letter).

Compilé et vérifié avec Angular 20. Code compatible Angular 19 et plus (composants autonomes, signaux, nouveau contrôle de flux).

## Installation

```bash
ng new portfolio-frontend --style=scss --routing --ssr=false
cd portfolio-frontend
```

1. Supprime les fichiers générés par défaut dans `src/app/` : `app.ts`, `app.html`, `app.scss`, `app.spec.ts` (ou `app.component.*` selon ta version), ainsi que `app.config.ts` et `app.routes.ts`.
2. Copie le contenu du dossier `src/` fourni dans le `src/` du projet, en remplaçant `index.html`, `main.ts` et `styles.scss`.
3. Ouvre `src/app/core/config.ts` et mets l'URL de ton backend :

```ts
export const API_URL = 'http://localhost:8080/api';
```

4. Lance le backend, puis :

```bash
ng serve
```

Ouvre http://localhost:4200. Le backend autorise déjà cette origine (`CORS_ALLOWED_ORIGINS`).

En production, mets l'URL publique du backend dans `config.ts` et ajoute l'URL du site dans `CORS_ALLOWED_ORIGINS` côté backend.

## Fonctionnement

- Les sections s'affichent dans l'ordre défini par le backend pour le marché choisi (`GET /api/public/portfolio?market=&lang=`).
- Le marché et la langue sont mémorisés dans le navigateur et dans l'URL (`?market=CANADA&lang=en`), donc un lien partagé ouvre le bon format.
- La fenêtre de code du haut de page reflète la configuration du marché : format, photo, dates, ordre des sections.
- Page `/cv` : feuille A4 ou Letter, estimation du nombre de pages, bouton d'impression (enregistrer en PDF depuis la boîte de dialogue). Un avertissement s'affiche si le CV dépasse le nombre de pages prévu pour le marché.
- Thème sombre, clair ou automatique (bouton dans la barre).
- Si le serveur gratuit est en veille, un message d'attente s'affiche après quelques secondes.

## Administration

Accessible sur http://localhost:4200/admin (connexion avec le compte créé par le backend : `ADMIN_EMAIL` et `ADMIN_PASSWORD`).

| Page | Contenu |
|---|---|
| Profil | identité, coordonnées, résumé, titre (champs en français et en anglais) |
| Expériences | postes, avec leurs tâches |
| Formations, Certifications, Langues | listes simples |
| Projets | projets personnels, professionnels ou open source, avec leurs points clés |
| Compétences | catégories et compétences avec niveau de 1 à 5 |
| Sections perso | sections créées par toi (bénévolat, références...) et leurs éléments |
| Marchés et sections | règles de chaque marché (format de page, photo, dates, nombre de pages) puis ordre, visibilité et plafond d'éléments des sections |

Comment ça marche :
- Chaque élément a un bouton Visible ou Masqué, des flèches pour l'ordre et une suppression en deux clics.
- Le champ « Marchés concernés » limite un élément à certains marchés (« Tous » par défaut).
- Les éléments enfants (tâches, points clés, compétences, éléments de section) apparaissent sous le formulaire du parent une fois celui-ci enregistré.
- Les langues vides sont ignorées : il suffit d'une langue renseignée. Les textes manquants retombent sur la langue du marché.
- La session dure le temps du jeton (120 minutes par défaut) ; au-delà, tu es renvoyé vers la page de connexion.
- La photo se renseigne par une URL (pas de téléversement de fichier pour l'instant).

## Structure

```
src/
├── index.html, main.ts, styles.scss
├── styles/            _tokens (couleurs, polices), _base, _ui, _layout, _cv
└── app/
    ├── core/          config, models, util, i18n, portfolio.service, theme.service, auth (service, interceptor, guard)
    ├── shared/        navbar, sélecteurs de marché et de langue, status, section-shell, directives glow et reveal
    ├── sections/      hero, about, experience, education, projects, skills, certifications, languages, custom, contact
    ├── pages/         home, cv (cv-page et cv-sheet)
    └── admin/         shell, login, profil, éditeur générique de collections, marchés et sections
```

## Personnaliser

- Couleurs, polices et rayons : `src/styles/_tokens.scss`.
- Textes de l'interface (français et anglais) : `src/app/core/i18n.ts`.
- Champs et libellés de l'administration : `src/app/admin/resources.ts` (ajouter un champ ou une ressource se fait là).
- Nouvelle langue : ajoute-la dans `LANGS` et `TEXTS` de `i18n.ts`, puis saisis les traductions dans l'admin.

## Remarques

- `ng build` en production télécharge les polices Google pour les intégrer : il faut une connexion internet.
- Les contenus (titres, tâches, descriptions) viennent du backend, déjà traduits.