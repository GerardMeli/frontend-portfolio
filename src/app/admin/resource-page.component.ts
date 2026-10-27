import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceEditorComponent } from './resource-editor.component';
import { RESOURCES } from '../core/resources';

/** Page d'administration d'une ressource, choisie par la donnée de route "resource". */
@Component({
  selector: 'app-resource-page',
  imports: [ResourceEditorComponent],
  template: `
    <header class="adm__head">
      <h1>{{ page.heading }}</h1>
      <p>{{ page.intro }}</p>
    </header>
    <app-resource-editor [path]="page.path" [config]="page.config" />
  `,
})
export class ResourcePageComponent {
  protected readonly page = RESOURCES[inject(ActivatedRoute).snapshot.data['resource']];
}
