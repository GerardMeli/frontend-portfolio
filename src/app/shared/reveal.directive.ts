import { DestroyRef, Directive, ElementRef, inject, input, signal } from '@angular/core';

/** Fait apparaître l'élément (fondu léger) quand il entre dans l'écran. Délai réglable en ms. */
@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[class.is-visible]': 'visible()',
    '[style.--reveal-delay]': 'delay() + "ms"',
  },
})
export class RevealDirective {
  readonly delay = input(0, { alias: 'appRevealDelay' });
  protected readonly visible = signal(false);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    if (typeof IntersectionObserver === 'undefined') {
      this.visible.set(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.visible.set(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}