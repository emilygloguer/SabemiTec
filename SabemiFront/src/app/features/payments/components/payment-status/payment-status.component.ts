import { Component, Input } from '@angular/core';
import { PaymentStatus } from '../../../../core/models/payment-status';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrl: './payment-status.component.scss',
})
export class PaymentStatusComponent {
  @Input({ required: true }) status!: PaymentStatus;

  get label(): string {
    return { Pendente: 'Processando', Sucesso: 'Concluído', Erro: 'Falhou' }[this.status];
  }
  get icon(): string {
    return { Pendente: '◌', Sucesso: '✓', Erro: '!' }[this.status];
  }
}
