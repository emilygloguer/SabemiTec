import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Payment } from '../../../../core/models/payment.model';
import { normalizePaymentReceivedStatus } from '../../../../core/models/payment-received-status';
import { PaymentStatusComponent } from '../payment-status/payment-status.component';

@Component({
  selector: 'app-payment-card',
  imports: [CurrencyPipe, DatePipe, PaymentStatusComponent, RouterLink],
  template: `
    <a
      class="payment-card surface-card"
      [routerLink]="['/payments', payment.id]"
      [attr.aria-label]="'Ver detalhes do pagamento ' + payment.transacaoId"
    >
      <div class="primary-info">
        <strong>{{ payment.valor | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}</strong
        ><span class="transaction-id">{{ payment.transacaoId || 'Sem transação' }}</span>
      </div>
      <div class="meta">
        <span class="contract-id">{{ payment.contratoId || 'não informado' }}</span
        ><span>{{ payment.dataPagamento | date: 'dd/MM/yyyy • HH:mm' : '-0300' : 'pt-BR' }}</span>
      </div>
      <div class="statuses">
        <div class="status-group">
          <span class="status-caption">Pagamento</span>
          <span
            class="received-status"
            [class.received-success]="receivedStatus === 'Sucesso'"
            [class.received-error]="receivedStatus === 'Erro'"
          >
            <span aria-hidden="true">{{
              receivedStatus === 'Sucesso' ? '✓' : receivedStatus === 'Erro' ? '!' : '◌'
            }}</span>
            {{ receivedStatus || payment.statusRecebido || 'Não informado' }}
          </span>
        </div>
        <div class="status-group">
          <span class="status-caption">Processamento</span>
          <app-payment-status [status]="payment.statusProcessamento" />
        </div>
      </div>
      <span class="details-arrow" aria-hidden="true">→</span>
    </a>
  `,
  styles: `
    .payment-card {
      align-items: center;
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-primary);
      color: inherit;
      display: grid;
      gap: 1rem;
      grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) auto auto;
      padding: 1rem 1.2rem;
      text-decoration: none;
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease;
    }
    .payment-card:hover {
      background: color-mix(in srgb, var(--color-surface) 94%, var(--color-cream-dark));
      border-color: var(--color-primary);
    }
    strong {
      display: block;
      font-family: Georgia, serif;
      font-size: 1.55rem;
      line-height: 1.05;
    }
    .meta {
      color: var(--color-text-muted);
      font-size: 0.88rem;
    }
    .transaction-id {
      color: var(--color-text-muted);
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 0.35rem;
    }
    .meta {
      display: grid;
      gap: 0.35rem;
      min-width: 0;
    }
    .contract-id {
      color: var(--color-success);
      font-size: 0.95rem;
      font-weight: 700;
      overflow-wrap: anywhere;
    }
    .meta span:last-child {
      color: var(--color-text-muted);
      font-size: 0.78rem;
    }
    .statuses {
      align-items: start;
      display: flex;
      gap: 1rem;
    }
    .status-group {
      align-items: start;
      display: grid;
      flex: 0 0 6.25rem;
      gap: 0.35rem;
    }
    .status-group:nth-child(2) {
      flex-basis: 7.5rem;
    }
    .status-caption {
      color: var(--color-text-muted);
      font-size: 0.68rem;
      letter-spacing: 0.04em;
    }
    .received-status {
      align-items: center;
      background: var(--color-cream-dark);
      border-color: transparent;
      border-radius: var(--radius-badge);
      color: var(--color-text-muted);
      display: inline-flex;
      font-size: 0.75rem;
      font-weight: 700;
      gap: 0.35rem;
      justify-self: start;
      padding: 0.3rem 0.55rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .received-success {
      background: var(--color-status-success-bg);
      color: var(--color-success);
    }
    .received-error {
      background: var(--color-status-error-bg);
      color: var(--color-error);
    }
    .details-arrow {
      align-items: center;
      color: var(--color-text-muted);
      display: inline-flex;
      font-size: 1.15rem;
      font-weight: 600;
      justify-content: center;
    }
    .payment-card:hover .details-arrow {
      color: var(--color-primary);
    }
    @media (max-width: 900px) {
      .payment-card {
        grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) auto;
      }
      .statuses {
        flex-direction: row;
        grid-column: 1 / 3;
        grid-row: 2;
      }
      .details-arrow {
        grid-column: 3;
        grid-row: 2;
        justify-self: end;
      }
    }
    @media (max-width: 700px) {
      .payment-card {
        grid-template-columns: 1fr;
      }
      .statuses {
        grid-column: auto;
        grid-row: auto;
      }
      .details-arrow {
        grid-column: auto;
        grid-row: auto;
        justify-self: end;
      }
    }
  `,
})
export class PaymentCardComponent {
  @Input({ required: true }) payment!: Payment;

  get receivedStatus(): ReturnType<typeof normalizePaymentReceivedStatus> {
    return normalizePaymentReceivedStatus(this.payment.statusRecebido);
  }
}
