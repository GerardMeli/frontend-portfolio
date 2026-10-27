import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/**
 * Bordure lumineuse qui suit le curseur : la bordure s'allume du côté de la souris
 * quand elle approche de l'élément. Inactif sur écran tactile.
 */
@Directive({ selector: '[appGlow]', host: { class: 'glow' } })
export class GlowDirective {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    if (window.matchMedia('(hover: none)').matches) return;

    let frame = 0;
    const near = 90;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = element.getBoundingClientRect();
        const inside =
          event.clientX > box.left - near &&
          event.clientX < box.right + near &&
          event.clientY > box.top - near &&
          event.clientY < box.bottom + near;
        element.style.setProperty('--glow-active', inside ? '1' : '0');
        if (inside) {
          const dx = event.clientX - (box.left + box.width / 2);
          const dy = event.clientY - (box.top + box.height / 2);
          const degrees = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
          element.style.setProperty('--glow-angle', String(degrees - 65));
        }
      });
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    });
  }
}