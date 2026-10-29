/** Modèles TypeScript alignés sur les vues publiques du backend (PortfolioView et associées). */

export type PageFormat = 'A4' | 'LETTER';

export interface MarketInfo {
  code: string;
  label: string;
  defaultLocale: string;
  pageFormat: PageFormat;
  dateFormat: string;
  showPhoto: boolean;
  showPersonalDetails: boolean;
  maxPages: number;
}

export interface Profile {
  fullName: string;
  headline?: string;
  summary?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  photoUrl?: string;
  birthDate?: string;
  nationality?: string;
  maritalStatus?: string;
  workAuthorization?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
}

export interface ExperienceView {
  company: string;
  location?: string;
  title?: string;
  description?: string;
  employmentType?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  tasks: string[];
}

export interface EducationView {
  institution: string;
  location?: string;
  degree?: string;
  fieldOfStudy?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectView {
  name: string;
  kind: string;
  description?: string;
  techStack: string[];
  demoUrl?: string;
  repoUrl?: string;
  startDate?: string;
  endDate?: string;
  highlights: string[];
}

export interface SkillView {
  name: string;
  level?: number;
}

/** Les deux sous-sections de la section Compétences. */
export type SkillKind = 'PROFESSIONAL' | 'PERSONAL';

export interface SkillGroupView {
  name?: string;
  kind: SkillKind;
  skills: SkillView[];
}

export interface CertificationView {
  name?: string;
  issuer?: string;
  issuedOn?: string;
  expiresOn?: string;
  credentialUrl?: string;
}

export interface LanguageView {
  name?: string;
  level?: string;
}

export interface CustomItemView {
  title?: string;
  subtitle?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
}

/** items dépend du type : SUMMARY = string[], EXPERIENCE = ExperienceView[], etc. */
export interface Section {
  type: string;
  title: string;
  items: unknown[];
}

export interface Portfolio {
  market: MarketInfo;
  lang: string;
  profile: Profile;
  sections: Section[];
}

export interface ApiProblem {
  offline: boolean;
  message: string;
}