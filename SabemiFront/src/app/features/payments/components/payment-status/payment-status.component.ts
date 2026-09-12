import { Component, Input } from '@angular/core';
import { PaymentStatus } from '../../../../core/models/payment-status';

@Component({
  selector: 'app-payment-status',
  template: `<span class="status" [class]="'status status-' + status.toLowerCase()"
    ><span aria-hidden="true">{{ icon }}</span
    >{{ label }}</span
  >`,
  styles: `
    .status {
      align-items: center;
      border-color: transparent;
      border-radius: var(--radius-badge);
      display: inline-flex;
      font-size: 0.75rem;
      font-weight: 700;
      gap: 0.35rem;
      padding: 0.3rem 0.55rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .status-pendente {
      background: var(--color-status-processing-bg);
      color: var(--color-processing);
    }
    .status-sucesso {
      background: var(--color-status-success-bg);
      color: var(--color-success);
    }
    .status-erro {
      background: var(--color-status-error-bg);
      color: var(--color-error);
    }
  `,
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
