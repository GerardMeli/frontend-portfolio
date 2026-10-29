export type Lang = 'fr' | 'en';
export const LANGS: Lang[] = ['fr', 'en'];

/** Textes de l'interface (les contenus du CV viennent du backend, déjà traduits). */
export interface UiText {
  present: string;
  marketLabel: string;
  pickerIntro: string;
  viewCv: string;
  printCv: string;
  back: string;
  contact: string;
  contactIntro: string;
  writeMe: string;
  emailLabel: string;
  phoneLabel: string;
  websiteLabel: string;
  loading: string;
  waking: string;
  errorTitle: string;
  errorOffline: string;
  retry: string;
  menu: string;
  language: string;
  demo: string;
  code: string;
  credential: string;
  skillsPro: string;
  skillsPersonal: string;
  footerMarket: string;
  cvPages: (pages: number, max: number) => string;
  cvTooLong: (max: number) => string;
  born: (date: string) => string;
  theme: Record<string, string>;
  employment: Record<string, string>;
  kind: Record<string, string>;
  marketShort: Record<string, string>;
}

const fr: UiText = {
  present: 'Présent',
  marketLabel: 'Marché du CV',
  pickerIntro: 'Choisissez votre marché : le CV change de format de page, de dates, de photo et d’ordre des sections.',
  viewCv: 'Voir le CV',
  printCv: 'Imprimer ou enregistrer en PDF',
  back: 'Retour au site',
  contact: 'Contact',
  contactIntro: 'Une opportunité, une question ? Écrivez-moi, je réponds rapidement.',
  writeMe: 'Écrire un e-mail',
  emailLabel: 'E-mail',
  phoneLabel: 'Téléphone',
  websiteLabel: 'Site web',
  loading: 'Chargement du portfolio…',
  waking: 'Le serveur se réveille, cela peut prendre une minute…',
  errorTitle: 'Impossible d’afficher le portfolio',
  errorOffline: 'Le serveur ne répond pas. Vérifiez que le backend est démarré et que l’URL de l’API est correcte.',
  retry: 'Réessayer',
  menu: 'Menu',
  language: 'Langue',
  demo: 'Démo',
  code: 'Code',
  credential: 'Voir la certification',
  skillsPro: 'Compétences professionnelles',
  skillsPersonal: 'Compétences personnelles',
  footerMarket: 'CV affiché pour le marché',
  cvPages: (n, max) => `Environ ${n} page${n > 1 ? 's' : ''} sur ${max} maximum`,
  cvTooLong: (max) => `Ce CV dépasse ${max} pages pour ce marché. Réduisez le nombre d’éléments par section dans l’administration.`,
  born: (date) => `Né(e) le ${date}`,
  theme: { light: 'Thème clair', dark: 'Thème sombre', auto: 'Thème automatique' },
  employment: {
    FULL_TIME: 'Temps plein',
    PART_TIME: 'Temps partiel',
    INTERNSHIP: 'Stage',
    FREELANCE: 'Freelance',
    CONTRACT: 'Contrat',
  },
  kind: { PERSONAL: 'Projet personnel', PROFESSIONAL: 'Projet professionnel', OPEN_SOURCE: 'Open source' },
  marketShort: { AFRICA: 'Afrique', CANADA: 'Canada', EU: 'Europe' },
};

const en: UiText = {
  present: 'Present',
  marketLabel: 'CV market',
  pickerIntro: 'Pick your market: the CV changes its page size, dates, photo and section order.',
  viewCv: 'View the CV',
  printCv: 'Print or save as PDF',
  back: 'Back to the site',
  contact: 'Contact',
  contactIntro: 'An opportunity or a question? Write to me, I reply quickly.',
  writeMe: 'Send an email',
  emailLabel: 'Email',
  phoneLabel: 'Phone',
  websiteLabel: 'Website',
  loading: 'Loading the portfolio…',
  waking: 'The server is waking up, this can take a minute…',
  errorTitle: 'The portfolio could not be displayed',
  errorOffline: 'The server is not responding. Check that the backend is running and that the API URL is correct.',
  retry: 'Try again',
  menu: 'Menu',
  language: 'Language',
  demo: 'Demo',
  code: 'Code',
  credential: 'View the credential',
  skillsPro: 'Professional skills',
  skillsPersonal: 'Personal skills',
  footerMarket: 'CV shown for the market',
  cvPages: (n, max) => `About ${n} page${n > 1 ? 's' : ''} of ${max} maximum`,
  cvTooLong: (max) => `This CV exceeds ${max} pages for this market. Reduce the number of items per section in the admin.`,
  born: (date) => `Born ${date}`,
  theme: { light: 'Light theme', dark: 'Dark theme', auto: 'Automatic theme' },
  employment: {
    FULL_TIME: 'Full time',
    PART_TIME: 'Part time',
    INTERNSHIP: 'Internship',
    FREELANCE: 'Freelance',
    CONTRACT: 'Contract',
  },
  kind: { PERSONAL: 'Personal project', PROFESSIONAL: 'Professional project', OPEN_SOURCE: 'Open source' },
  marketShort: { AFRICA: 'Africa', CANADA: 'Canada', EU: 'Europe' },
};

const TEXTS: Record<Lang, UiText> = { fr, en };

export function textsFor(lang: string | null | undefined): UiText {
  return TEXTS[(lang ?? 'fr') as Lang] ?? en;
}