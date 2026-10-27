import { LANGS } from '../core/i18n';

export type Rec = Record<string, unknown>;

export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'email'
  | 'date'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'i18n'
  | 'i18n-area'
  | 'markets'
  | 'tags';

export interface Option {
  value: string;
  label: string;
}

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Option[];
  hint?: string;
  /** Champ non modifiable une fois l'élément créé (ex. code d'une section). */
  lockOnEdit?: boolean;
  /** Valeur de liste déroulante convertie en nombre. */
  numeric?: boolean;
  /** Met la saisie en majuscules. */
  upper?: boolean;
}

export interface CollectionConfig {
  label: string;
  singular: string;
  /** Champ identifiant (id par défaut, code pour les marchés). */
  idKey?: string;
  fields: Field[];
  title: (item: Rec) => string;
  subtitle?: (item: Rec) => string;
  reorder: boolean;
  /** Affiche le bouton Visible / Masqué (élément avec un champ visible). */
  hasVisible: boolean;
  defaults?: Rec;
  child?: ChildConfig;
}

export interface ChildConfig extends CollectionConfig {
  /** Segment d'URL : /experiences/{id}/tasks. */
  segment: string;
}

export interface ResourcePage {
  path: string;
  heading: string;
  intro: string;
  config: CollectionConfig;
}

/** Texte d'un champ traduisible : français d'abord, sinon la première langue renseignée. */
export function tr(value: unknown): string {
  const map = value as Record<string, string> | null | undefined;
  if (!map) return '';
  return map['fr'] || map['en'] || Object.values(map).find(Boolean) || '';
}

export function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

const markets: Field = { key: 'markets', label: 'Marchés concernés', type: 'markets' };
const visible: Field = { key: 'visible', label: 'Visible sur le site', type: 'checkbox' };

const employment: Option[] = [
  { value: 'FULL_TIME', label: 'Temps plein' },
  { value: 'PART_TIME', label: 'Temps partiel' },
  { value: 'INTERNSHIP', label: 'Stage' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'CONTRACT', label: 'Contrat' },
];

const kinds: Option[] = [
  { value: 'PERSONAL', label: 'Projet personnel' },
  { value: 'PROFESSIONAL', label: 'Projet professionnel' },
  { value: 'OPEN_SOURCE', label: 'Open source' },
];

const levels: Option[] = [
  { value: '1', label: '1 - Notions' },
  { value: '2', label: '2 - Débutant' },
  { value: '3', label: '3 - Intermédiaire' },
  { value: '4', label: '4 - Avancé' },
  { value: '5', label: '5 - Expert' },
];

export const PROFILE_FIELDS: Field[] = [
  { key: 'fullName', label: 'Nom complet', type: 'text', required: true },
  { key: 'headline', label: 'Titre professionnel', type: 'i18n' },
  { key: 'summary', label: 'Résumé', type: 'i18n-area' },
  { key: 'email', label: 'E-mail', type: 'email' },
  { key: 'phone', label: 'Téléphone', type: 'text' },
  { key: 'city', label: 'Ville', type: 'text' },
  { key: 'country', label: 'Pays', type: 'text' },
  { key: 'photoUrl', label: 'Photo (URL)', type: 'url', hint: 'Affichée seulement sur les marchés qui l’autorisent.' },
  { key: 'birthDate', label: 'Date de naissance', type: 'date', hint: 'Affichée seulement sur les marchés qui autorisent les infos personnelles.' },
  { key: 'nationality', label: 'Nationalité', type: 'text' },
  { key: 'maritalStatus', label: 'Situation familiale', type: 'text' },
  { key: 'workAuthorization', label: 'Autorisation de travail', type: 'i18n', hint: 'Utile pour le Canada et l’Europe (ex. ouvert à la mobilité).' },
  { key: 'linkedinUrl', label: 'LinkedIn', type: 'url' },
  { key: 'githubUrl', label: 'GitHub', type: 'url' },
  { key: 'websiteUrl', label: 'Site web', type: 'url' },
];

const experienceTasks: ChildConfig = {
  segment: 'tasks',
  label: 'Tâches',
  singular: 'Tâche',
  fields: [{ key: 'content', label: 'Tâche', type: 'i18n-area', required: true }, markets, visible],
  title: (t) => tr(t['content']),
  reorder: true,
  hasVisible: true,
  defaults: { visible: true },
};

const projectHighlights: ChildConfig = {
  segment: 'highlights',
  label: 'Points clés',
  singular: 'Point clé',
  fields: [{ key: 'content', label: 'Point clé', type: 'i18n-area', required: true }, visible],
  title: (h) => tr(h['content']),
  reorder: true,
  hasVisible: true,
  defaults: { visible: true },
};

const skillItems: ChildConfig = {
  segment: 'skills',
  label: 'Compétences',
  singular: 'Compétence',
  fields: [
    { key: 'name', label: 'Nom', type: 'text', required: true },
    { key: 'level', label: 'Niveau', type: 'select', options: levels, numeric: true },
    markets,
    visible,
  ],
  title: (s) => text(s['name']),
  subtitle: (s) => (s['level'] ? `Niveau ${s['level']}/5` : ''),
  reorder: true,
  hasVisible: true,
  defaults: { visible: true },
};

const customItems: ChildConfig = {
  segment: 'items',
  label: 'Éléments',
  singular: 'Élément',
  fields: [
    { key: 'title', label: 'Titre', type: 'i18n', required: true },
    { key: 'subtitle', label: 'Sous-titre', type: 'text' },
    { key: 'description', label: 'Description', type: 'i18n-area' },
    { key: 'startDate', label: 'Début', type: 'date' },
    { key: 'endDate', label: 'Fin', type: 'date' },
    { key: 'url', label: 'Lien', type: 'url' },
    markets,
    visible,
  ],
  title: (i) => tr(i['title']),
  subtitle: (i) => text(i['subtitle']),
  reorder: true,
  hasVisible: true,
  defaults: { visible: true },
};

export const RESOURCES: Record<string, ResourcePage> = {
  experiences: {
    path: '/experiences',
    heading: 'Expériences',
    intro: 'Postes et missions, avec leurs tâches. Réservez une tâche à un marché pour ne l’afficher que là.',
    config: {
      label: 'Expériences',
      singular: 'Expérience',
      fields: [
        { key: 'company', label: 'Entreprise', type: 'text', required: true },
        { key: 'location', label: 'Lieu', type: 'text' },
        { key: 'title', label: 'Intitulé du poste', type: 'i18n', required: true },
        { key: 'description', label: 'Description', type: 'i18n-area' },
        { key: 'employmentType', label: 'Type de contrat', type: 'select', options: employment },
        { key: 'startDate', label: 'Début', type: 'date', required: true },
        { key: 'endDate', label: 'Fin', type: 'date' },
        { key: 'current', label: 'Poste actuel', type: 'checkbox' },
        markets,
        visible,
      ],
      title: (e) => tr(e['title']),
      subtitle: (e) => text(e['company']),
      reorder: true,
      hasVisible: true,
      defaults: { visible: true, current: false },
      child: experienceTasks,
    },
  },
  educations: {
    path: '/educations',
    heading: 'Formations',
    intro: 'Diplômes et parcours de formation.',
    config: {
      label: 'Formations',
      singular: 'Formation',
      fields: [
        { key: 'institution', label: 'Établissement', type: 'text', required: true },
        { key: 'location', label: 'Lieu', type: 'text' },
        { key: 'degree', label: 'Diplôme', type: 'i18n', required: true },
        { key: 'fieldOfStudy', label: 'Spécialité', type: 'i18n' },
        { key: 'description', label: 'Description', type: 'i18n-area' },
        { key: 'startDate', label: 'Début', type: 'date' },
        { key: 'endDate', label: 'Fin', type: 'date' },
        markets,
        visible,
      ],
      title: (e) => tr(e['degree']),
      subtitle: (e) => text(e['institution']),
      reorder: true,
      hasVisible: true,
      defaults: { visible: true },
    },
  },
  projects: {
    path: '/projects',
    heading: 'Projets',
    intro: 'Projets personnels, professionnels ou open source, avec leurs points clés.',
    config: {
      label: 'Projets',
      singular: 'Projet',
      fields: [
        { key: 'name', label: 'Nom', type: 'text', required: true },
        { key: 'kind', label: 'Type', type: 'select', options: kinds, required: true },
        { key: 'description', label: 'Description', type: 'i18n-area' },
        { key: 'techStack', label: 'Technologies', type: 'tags', hint: 'Séparées par des virgules : Java, Spring Boot, Angular' },
        { key: 'demoUrl', label: 'Lien de démo', type: 'url' },
        { key: 'repoUrl', label: 'Lien du code', type: 'url' },
        { key: 'startDate', label: 'Début', type: 'date' },
        { key: 'endDate', label: 'Fin', type: 'date' },
        markets,
        visible,
      ],
      title: (p) => text(p['name']),
      subtitle: (p) => text(p['kind']).toLowerCase().replace('_', ' '),
      reorder: true,
      hasVisible: true,
      defaults: { visible: true, kind: 'PERSONAL' },
      child: projectHighlights,
    },
  },
  skills: {
    path: '/skill-categories',
    heading: 'Compétences',
    intro: 'Classez les catégories en compétences personnelles ou professionnelles, puis ajoutez les compétences qu’elles contiennent.',
    config: {
      label: 'Catégories',
      singular: 'Catégorie',
      fields: [
        { key: 'name', label: 'Nom de la catégorie', type: 'i18n', required: true },
        {
          key: 'type',
          label: 'Type de compétences',
          type: 'select',
          required: true,
          options: [
            { value: 'PERSONAL', label: 'Compétences personnelles' },
            { value: 'PROFESSIONAL', label: 'Compétences professionnelles' },
          ],
        },
        visible,
      ],
      title: (c) => tr(c['name']),
      subtitle: (c) => c['type'] === 'PERSONAL' ? 'Personnelles' : 'Professionnelles',
      reorder: true,
      hasVisible: true,
      defaults: { type: 'PROFESSIONAL', visible: true },
      child: skillItems,
    },
  },
  certifications: {
    path: '/certifications',
    heading: 'Certifications',
    intro: 'Certifications et attestations.',
    config: {
      label: 'Certifications',
      singular: 'Certification',
      fields: [
        { key: 'name', label: 'Nom', type: 'i18n', required: true },
        { key: 'issuer', label: 'Organisme', type: 'text' },
        { key: 'issuedOn', label: 'Obtenue le', type: 'date' },
        { key: 'expiresOn', label: 'Expire le', type: 'date' },
        { key: 'credentialUrl', label: 'Lien de vérification', type: 'url' },
        markets,
        visible,
      ],
      title: (c) => tr(c['name']),
      subtitle: (c) => text(c['issuer']),
      reorder: true,
      hasVisible: true,
      defaults: { visible: true },
    },
  },
  languages: {
    path: '/languages',
    heading: 'Langues',
    intro: 'Langues parlées et niveau.',
    config: {
      label: 'Langues',
      singular: 'Langue',
      fields: [
        { key: 'name', label: 'Langue', type: 'i18n', required: true },
        { key: 'level', label: 'Niveau', type: 'text', hint: 'A1 à C2, ou Natif' },
        visible,
      ],
      title: (l) => tr(l['name']),
      subtitle: (l) => text(l['level']),
      reorder: true,
      hasVisible: true,
      defaults: { visible: true },
    },
  },
  'custom-sections': {
    path: '/custom-sections',
    heading: 'Sections personnalisées',
    intro:
      'Créez vos propres sections (bénévolat, références, publications...). Une nouvelle section est ajoutée en dernière position dans chaque marché : placez-la ensuite dans « Marchés et sections ».',
    config: {
      label: 'Sections',
      singular: 'Section',
      fields: [
        { key: 'code', label: 'Code', type: 'text', required: true, lockOnEdit: true, upper: true, hint: 'Majuscules, chiffres et _ (ex. VOLUNTEERING). Non modifiable ensuite.' },
        { key: 'title', label: 'Titre de la section', type: 'i18n', required: true },
        markets,
        visible,
      ],
      title: (s) => tr(s['title']),
      subtitle: (s) => text(s['code']),
      reorder: false,
      hasVisible: true,
      defaults: { visible: true },
      child: customItems,
    },
  },
};

export const MARKET_CONFIG: CollectionConfig = {
  label: 'Marchés',
  singular: 'Marché',
  idKey: 'code',
  fields: [
    { key: 'code', label: 'Code', type: 'text', required: true, lockOnEdit: true, upper: true, hint: 'Ex. AFRICA, CANADA, EU, UK. Non modifiable ensuite.' },
    { key: 'label', label: 'Nom', type: 'text', required: true },
    {
      key: 'defaultLocale',
      label: 'Langue par défaut',
      type: 'select',
      required: true,
      options: LANGS.map((l) => ({ value: l, label: l.toUpperCase() })),
    },
    {
      key: 'pageFormat',
      label: 'Format de page',
      type: 'select',
      required: true,
      options: [
        { value: 'A4', label: 'A4' },
        { value: 'LETTER', label: 'Letter (Amérique du Nord)' },
      ],
    },
    {
      key: 'dateFormat',
      label: 'Format des dates',
      type: 'select',
      required: true,
      options: [
        { value: 'MM/yyyy', label: '03/2024' },
        { value: 'MMM yyyy', label: 'Mar 2024' },
        { value: 'yyyy', label: '2024' },
      ],
    },
    { key: 'showPhoto', label: 'Afficher la photo', type: 'checkbox' },
    { key: 'showPersonalDetails', label: 'Afficher date de naissance, nationalité et situation familiale', type: 'checkbox' },
    { key: 'maxPages', label: 'Nombre de pages maximum', type: 'number', required: true },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  title: (m) => text(m['label']),
  subtitle: (m) => `${text(m['code'])} - ${text(m['pageFormat'])}`,
  reorder: false,
  hasVisible: false,
  defaults: {
    defaultLocale: 'en',
    pageFormat: 'A4',
    dateFormat: 'MM/yyyy',
    showPhoto: false,
    showPersonalDetails: false,
    maxPages: 2,
  },
};
