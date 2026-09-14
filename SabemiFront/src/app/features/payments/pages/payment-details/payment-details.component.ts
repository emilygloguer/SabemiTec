import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, timer } from 'rxjs';
import { catchError, switchMap, takeWhile } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Payment } from '../../../../core/models/payment.model';
import { PaymentService } from '../../../../core/services/payment.service';
import { LadybugIconComponent } from '../../../../shared/components/ladybug-icon/ladybug-icon.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { PaymentStatusComponent } from '../../components/payment-status/payment-status.component';

@Component({
  selector: 'app-payment-details',
  imports: [
    CurrencyPipe,
    DatePipe,
    LadybugIconComponent,
    LoadingComponent,
    PaymentStatusComponent,
    RouterLink,
  ],
  templateUrl: './payment-details.component.html',
  styleUrl: './payment-details.component.scss',
})
export class PaymentDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentService = inject(PaymentService);
  private readonly destroyRef = inject(DestroyRef);
  readonly payment = signal<Payment | undefined>(undefined);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Pagamento não encontrado.');
      this.loading.set(false);
      return;
    }

    timer(0, 5000)
      .pipe(
        switchMap(() => this.paymentService.getPaymentById(id)),
        takeWhile((payment) => payment.statusProcessamento === 'Pendente', true),
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.error.set('Não foi possível carregar este pagamento.');
          this.loading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((payment) => {
        this.payment.set(payment);
        this.loading.set(false);
      });
  }

  get processingMessage(): string {
    const payment = this.payment();
    if (!payment) return '';
    return {
      Pendente: 'Processando pagamento...',
      Sucesso: 'Processamento concluído',
      Erro: 'Falha no processamento',
    }[payment.statusProcessamento];
  }
}
