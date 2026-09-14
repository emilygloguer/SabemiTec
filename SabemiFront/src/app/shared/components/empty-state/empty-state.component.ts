import { Component, Input } from '@angular/core';
import { LadybugIconComponent } from '../ladybug-icon/ladybug-icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [LadybugIconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Input() title = 'Nenhum pagamento por aqui ainda.';
  @Input() description = 'Quando um pagamento chegar, ele aparecerá nesta lista.';
}
