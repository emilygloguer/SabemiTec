import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Payment } from '../../../../core/models/payment.model';
import { normalizePaymentReceivedStatus } from '../../../../core/models/payment-received-status';
import { PaymentService } from '../../../../core/services/payment.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { PaymentCardComponent } from '../../components/payment-card/payment-card.component';
import { PaymentSummaryComponent } from '../../components/payment-summary/payment-summary.component';
import {
  PaymentResultOption,
  PaymentResultSelectComponent,
} from '../../components/payment-result-select/payment-result-select.component';

@Component({
  selector: 'app-payment-list',
  imports: [
    EmptyStateComponent,
    FormsModule,
    LoadingComponent,
    PaymentCardComponent,
    PaymentResultSelectComponent,
    PaymentSummaryComponent,
    RouterLink,
  ],
  template: `
    <section class="page-heading">
      <div>
        <p class="kicker">Sabemi Pay</p>
        <h1>Pagamentos</h1>
        <p>Acompanhe seus pagamentos e processamentos.</p>
      </div>
    </section>
    @if (loading()) {
      <app-loading />
    } @else if (error()) {
      <section class="feedback surface-card">
        <p>{{ error() }}</p>
        <button class="button button-secondary" (click)="loadPayments()">Tentar novamente</button>
      </section>
    } @else {
      <section class="summary-grid" aria-label="Resumo dos pagamentos">
        <app-payment-summary label="Total" [value]="payments().length" /><app-payment-summary
          label="Processando"
          [value]="count('Pendente')"
          variant="processing"
        /><app-payment-summary
          label="Concluídos"
          [value]="count('Sucesso')"
          variant="success"
        /><app-payment-summary label="Falharam" [value]="count('Erro')" variant="error" />
      </section>
      <section class="filters-row" aria-label="Filtros de pagamentos">
        <label class="search">
          <span>Buscar por contrato</span>
          <input
            type="text"
            [ngModel]="query()"
            (ngModelChange)="query.set($event)"
            placeholder="ID do contrato"
          />
        </label>
        <div class="status-filter">
          <span>Status do pagamento</span>
          <app-payment-result-select
            ariaLabel="Filtrar por status do pagamento"
            placeholder="Todos"
            [options]="statusFilterOptions"
            [value]="statusFilter()"
            (valueChange)="statusFilter.set($event)"
          />
        </div>
        <a class="button button-primary new-payment" routerLink="/payments/new">Novo pagamento</a>
      </section>
      @if (filteredPayments.length) {
        <section class="payment-list" aria-label="Lista de pagamentos">
          @for (payment of filteredPayments; track payment.id) {
            <app-payment-card [payment]="payment" />
          }
        </section>
      } @else {
        <app-empty-state
          [title]="
            payments().length ? 'Nenhum resultado encontrado.' : 'Nenhum pagamento por aqui ainda.'
          "
          [description]="
            payments().length
              ? 'Ajuste o contrato ou o status selecionado.'
              : 'Crie um novo pagamento para iniciar o acompanhamento.'
          "
        />
      }
    }
  `,
  styles: `
    .page-heading {
      align-items: end;
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .kicker {
      color: var(--color-primary);
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(2rem, 4vw, 3rem);
      margin-bottom: 0.5rem;
    }
    .page-heading p:not(.kicker) {
      color: var(--color-text-muted);
      margin-bottom: 0;
    }
    .summary-grid {
      display: grid;
      gap: 0.85rem;
      grid-template-columns: repeat(4, 1fr);
      margin-bottom: 1.5rem;
    }
    .filters-row {
      align-items: end;
      display: grid;
      gap: 0.85rem;
      grid-template-columns: minmax(14rem, 1fr) minmax(12rem, 0.55fr) auto;
      margin-bottom: 1.25rem;
    }
    .search,
    .status-filter {
      display: grid;
      gap: 0.4rem;
      min-width: 0;
    }
    .search span,
    .status-filter span {
      color: var(--color-text-muted);
      font-size: 0.85rem;
      font-weight: 700;
    }
    input {
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-control);
      color: var(--color-text);
      min-height: 2.75rem;
      padding: 0.6rem 0.75rem;
    }
    .search input {
      border-width: 2px;
    }
    .search input::placeholder {
      color: var(--color-text);
      opacity: 1;
    }
    input:focus {
      border-color: var(--color-primary);
      outline: 2px solid var(--color-focus-ring);
    }
    .new-payment {
      white-space: nowrap;
    }
    .payment-list {
      display: grid;
      gap: 1rem;
    }
    .feedback {
      align-items: center;
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      padding: 1.2rem;
    }
    .feedback p {
      margin: 0;
    }
    @media (max-width: 700px) {
      .page-heading {
        align-items: start;
        flex-direction: column;
      }
      .filters-row {
        align-items: stretch;
        grid-template-columns: 1fr;
      }
      .new-payment {
        width: 100%;
      }
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .feedback {
        align-items: start;
        flex-direction: column;
      }
    }
  `,
})
export class PaymentListComponent {
  private readonly paymentService = inject(PaymentService);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly payments = signal<Payment[]>([]);
  readonly query = signal('');
  readonly statusFilter = signal('');
  readonly statusFilterOptions: PaymentResultOption[] = [
    { value: '', label: 'Todos' },
    { value: 'Sucesso', label: 'Sucesso' },
    { value: 'Erro', label: 'Erro' },
  ];

  constructor() {
    this.loadPayments();
  }

  get filteredPayments(): Payment[] {
    const term = this.query().trim().toLocaleLowerCase();
    const status = this.statusFilter().trim().toLocaleLowerCase();

    return this.payments().filter((payment) => {
      const matchesContract = (payment.contratoId ?? '').toLocaleLowerCase().includes(term);
      const receivedStatus = normalizePaymentReceivedStatus(payment.statusRecebido);
      const matchesStatus = !status || receivedStatus?.toLocaleLowerCase() === status;

      return matchesContract && matchesStatus;
    });
  }

  count(status: Payment['statusProcessamento']): number {
    return this.payments().filter((payment) => payment.statusProcessamento === status).length;
  }

  loadPayments(): void {
    this.loading.set(true);
    this.error.set('');
    this.paymentService.getPayments().subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Houve um erro ao carregar os pagamentos.');
        this.loading.set(false);
      },
    });
  }
}
