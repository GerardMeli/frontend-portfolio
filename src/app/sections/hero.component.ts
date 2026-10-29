import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../core/portfolio.service';
import { Portfolio } from '../core/models';
import { mediaUrl, prettyUrl, scrollToAnchor } from '../core/util';
import { MarketSwitcherComponent } from '../shared/market-switcher.component';
import { GlowDirective } from '../shared/glow.directve';

interface Part {
  text: string;
  kind: 'kw' | 'var' | 'key' | 'str' | 'lit' | 'p';
}
interface CodeLine {
  id: string;
  indent: number;
  parts: Part[];
}

@Component({
  selector: 'app-hero',
  imports: [RouterLink, GlowDirective, MarketSwitcherComponent],
  template: `
    <section class="hero wrap" id="top">
      <div class="hero__copy">
        @if (photo(); as src) {
          <div class="hero__avatar"><img [src]="src" [alt]="portfolio().profile.fullName" /></div>
        }
        <h1 class="hero__name">{{ portfolio().profile.fullName }}</h1>
        @if (portfolio().profile.headline) {
          <p class="hero__headline">{{ portfolio().profile.headline }}</p>
        }
        @if (location()) {
          <p class="hero__meta">{{ location() }}</p>
        }

        <div class="hero__links">
          @if (portfolio().profile.githubUrl; as url) {
            <a class="chip chip--link" [href]="url" target="_blank" rel="noopener">GitHub</a>
          }
          @if (portfolio().profile.linkedinUrl; as url) {
            <a class="chip chip--link" [href]="url" target="_blank" rel="noopener">LinkedIn</a>
          }
          @if (portfolio().profile.websiteUrl; as url) {
            <a class="chip chip--link" [href]="url" target="_blank" rel="noopener">{{ pretty(url) }}</a>
          }
        </div>

        <div class="hero__cta">
          <a class="btn btn--grad" routerLink="/cv" [queryParams]="svc.queryParams()">{{ ui().viewCv }}</a>
          <a class="btn btn--ghost" href="#contact" (click)="go($event, 'contact')">{{ ui().contact }}</a>
        </div>

        <div class="hero__picker">
          <p>{{ ui().pickerIntro }}</p>
          <app-market-switcher />
        </div>
      </div>

      <div class="codewin" appGlow>
        <div class="codewin__bar">
          <span class="codewin__dot"></span><span class="codewin__dot"></span><span class="codewin__dot"></span>
          <span class="codewin__file">cv.config.ts</span>
        </div>
        <pre class="codewin__body" aria-label="Configuration du CV pour le marché choisi"><code>@for (line of lines(); track line.id) {<div class="code__line" [style.--i]="$index"><span class="code__indent" [style.--n]="line.indent"></span>@for (part of line.parts; track $index) {<span [class]="'tok-' + part.kind">{{ part.text }}</span>}</div>}</code></pre>
      </div>
    </section>
  `,
})
export class HeroComponent {
  protected readonly svc = inject(PortfolioService);
  protected readonly ui = this.svc.ui;
  protected readonly pretty = prettyUrl;
  protected readonly go = scrollToAnchor;
  readonly portfolio = input.required<Portfolio>();

  /** Photo affichée seulement si le marché choisi l'autorise. */
  protected readonly photo = computed(() => {
    const p = this.portfolio();
    return p.market.showPhoto ? mediaUrl(p.profile.photoUrl) : undefined;
  });

  protected readonly location = computed(() => {
    const p = this.portfolio().profile;
    return [p.city, p.country].filter(Boolean).join(', ');
  });

  /** Le fichier de configuration affiché reflète le marché choisi : c'est ce qui change quand on bascule. */
  protected readonly lines = computed<CodeLine[]>(() => {
    const { market, lang, sections } = this.portfolio();
    const str = (text: string): Part => ({ text: `"${text}"`, kind: 'str' });
    const lit = (text: string): Part => ({ text, kind: 'lit' });
    const p = (text: string): Part => ({ text, kind: 'p' });
    const entry = (key: string, value: Part): CodeLine => ({
      id: `${key}:${value.text}`,
      indent: 1,
      parts: [{ text: key, kind: 'key' }, p(': '), value, p(',')],
    });

    const lines: CodeLine[] = [
      { id: 'open', indent: 0, parts: [{ text: 'const ', kind: 'kw' }, { text: 'cv', kind: 'var' }, p(' = {')] },
      entry('market', str(market.code)),
      entry('language', str(lang)),
      entry('page', str(market.pageFormat)),
      entry('photo', lit(String(market.showPhoto))),
      entry('personalDetails', lit(String(market.showPersonalDetails))),
      entry('dates', str(market.dateFormat)),
      entry('maxPages', lit(String(market.maxPages))),
      { id: 'sections-open', indent: 1, parts: [{ text: 'sections', kind: 'key' }, p(': [')] },
      ...sections.map((s, i): CodeLine => ({ id: `section:${i}:${s.type}`, indent: 2, parts: [str(s.type), p(',')] })),
      { id: 'sections-close', indent: 1, parts: [p('],')] },
      { id: 'close', indent: 0, parts: [p('};')] },
    ];
    return lines;
  });
}