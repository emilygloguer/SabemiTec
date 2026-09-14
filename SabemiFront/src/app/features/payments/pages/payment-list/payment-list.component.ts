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
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss',
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
