import { UiText } from './i18n';
import { Section, SkillGroupView, SkillKind } from './models';
import { anchorOf } from './util';

export interface NavChild {
  id: string;
  label: string;
}

export interface NavItem {
  id: string;
  label: string;
  children: NavChild[];
}

/** Identifiant d'ancre d'une sous-section de Compétences. */
export function skillSubId(kind: SkillKind): string {
  return kind === 'PERSONAL' ? 'skill-personal' : 'skill-professional';
}

/**
 * Entrées du menu : une par section dans l'ordre du marché, puis Contact.
 * Compétences a deux sous-entrées (professionnelles, personnelles) quand elles existent.
 * Deux sections de même titre sont distinguées par un numéro.
 */
export function buildNavItems(sections: Section[], ui: UiText): NavItem[] {
  const seen = new Map<string, number>();
  const items = sections.map((section): NavItem => {
    const count = seen.get(section.title) ?? 0;
    seen.set(section.title, count + 1);

    const children: NavChild[] = [];
    if (section.type === 'SKILL') {
      const kinds = new Set((section.items as SkillGroupView[]).map((g) => g.kind ?? 'PROFESSIONAL'));
      if (kinds.has('PROFESSIONAL')) children.push({ id: skillSubId('PROFESSIONAL'), label: ui.skillsPro });
      if (kinds.has('PERSONAL')) children.push({ id: skillSubId('PERSONAL'), label: ui.skillsPersonal });
    }
    return {
      id: anchorOf(section.type),
      label: count ? `${section.title} ${count + 1}` : section.title,
      children,
    };
  });
  items.push({ id: 'contact', label: ui.contact, children: [] });
  return items;
}