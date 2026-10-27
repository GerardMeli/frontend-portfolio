import { Component } from '@angular/core';
import { MarketSectionsComponent } from './market-sections.component';
import { ResourceEditorComponent } from './resource-editor.component';
import { MARKET_CONFIG } from '../core/resources';

@Component({
  selector: 'app-markets-page',
  imports: [ResourceEditorComponent, MarketSectionsComponent],
  template: `
    <header class="adm__head">
      <h1>Marchés et sections</h1>
      <p>Règles de rendu de chaque marché (format de page, photo, dates), puis ordre et visibilité des sections pour chacun.</p>
    </header>
    <app-resource-editor path="/markets" [config]="config" />
    <div class="adm__gap"></div>
    <app-market-sections />
  `,
})
export class MarketsPageComponent {
  protected readonly config = MARKET_CONFIG;
}
