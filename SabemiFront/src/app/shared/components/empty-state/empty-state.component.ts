import { Component, Input } from '@angular/core';
import { LadybugIconComponent } from '../ladybug-icon/ladybug-icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [LadybugIconComponent],
  template: `<section class="empty surface-card">
    <app-ladybug-icon />
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </section>`,
  styles: `
    .empty {
      padding: 2.5rem;
      text-align: center;
    }
    h2 {
      font-size: 1.35rem;
      margin: 0.75rem 0 0.35rem;
    }
    p {
      color: var(--color-text-muted);
      margin-bottom: 0;
    }
  `,
})
export class EmptyStateComponent {
  @Input() title = 'Nenhum pagamento por aqui ainda.';
  @Input() description = 'Quando um pagamento chegar, ele aparecerá nesta lista.';
}
