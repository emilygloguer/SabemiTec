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
  template: `
    <a class="back" routerLink="/payments">← Pagamentos</a>
    @if (loading()) {
      <app-loading message="Carregando pagamento..." />
    } @else if (error()) {
      <section class="feedback surface-card">
        <p>{{ error() }}</p>
        <a class="button button-secondary" routerLink="/payments">Voltar para pagamentos</a>
      </section>
    } @else if (payment(); as payment) {
      <section class="detail surface-card">
        <p class="kicker">Pagamento</p>
        <div class="title-row">
          <div>
            <h1>{{ payment.transacaoId || 'Sem transação' }}</h1>
            <p class="amount">
              {{ payment.valor | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
            </p>
          </div>
          <app-payment-status [status]="payment.statusProcessamento" />
        </div>
        @if (payment.statusProcessamento === 'Pendente') {
          <section class="processing">
            <app-ladybug-icon />
            <div>
              <strong>Estamos processando seu pagamento.</strong>
              <p>Esta página será atualizada automaticamente.</p>
            </div>
          </section>
        }
        <dl>
          <div>
            <dt>Contrato</dt>
            <dd>{{ payment.contratoId || 'Não informado' }}</dd>
          </div>
          <div>
            <dt>Data do pagamento</dt>
            <dd>{{ payment.dataPagamento | date: "dd/MM/yyyy 'às' HH:mm" : '-0300' : 'pt-BR' }}</dd>
          </div>
          <div>
            <dt>Recebido em</dt>
            <dd>{{ payment.dataRecebimento | date: "dd/MM/yyyy 'às' HH:mm:ss" : '-0300' : 'pt-BR' }}</dd>
          </div>
        </dl>
        <section class="timeline">
          <h2>Status</h2>
          <div class="timeline-item complete">
            <span>✓</span>
            <div>
              <strong>Pagamento recebido</strong>
              <p>{{ payment.dataRecebimento | date: 'HH:mm:ss' : '-0300' : 'pt-BR' }}</p>
            </div>
          </div>
          <div
            class="timeline-item"
            [class.complete]="payment.statusProcessamento !== 'Pendente'"
            [class.failed]="payment.statusProcessamento === 'Erro'"
          >
            <span>{{
              payment.statusProcessamento === 'Pendente'
                ? '◌'
                : payment.statusProcessamento === 'Erro'
                  ? '!'
                  : '✓'
            }}</span>
            <div>
              <strong>{{ processingMessage }}</strong>
              @if (payment.statusProcessamento === 'Pendente') {
                <p>Atualizando automaticamente</p>
              } @else if (payment.dataProcessamento) {
                <p>{{ payment.dataProcessamento | date: "dd/MM/yyyy 'às' HH:mm:ss" : '-0300' : 'pt-BR' }}</p>
              } @else {
                <p>Horário de conclusão não disponível.</p>
              }
            </div>
          </div>
        </section>
        @if (payment.mensagemErro) {
          <p class="error-message" role="alert">{{ payment.mensagemErro }}</p>
        }
      </section>
    }
  `,
  styles: `
    .back {
      color: var(--color-primary);
      display: inline-block;
      font-weight: 700;
      margin-bottom: 1.5rem;
      text-decoration: none;
    }
    .detail {
      margin: 0 auto;
      max-width: 46rem;
      padding: clamp(1.25rem, 4vw, 2.5rem);
    }
    .kicker {
      color: var(--color-primary);
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .title-row {
      align-items: center;
      display: flex;
      gap: 1rem;
      justify-content: space-between;
    }
    h1 {
      font-size: clamp(1.8rem, 5vw, 2.7rem);
      margin-bottom: 0.35rem;
      overflow-wrap: anywhere;
    }
    .amount {
      font-family: Georgia, serif;
      font-size: 1.5rem;
      margin-bottom: 0;
    }
    .processing {
      align-items: center;
      background: var(--color-status-processing-bg);
      border: 2px dashed var(--color-processing);
      border-radius: var(--radius-control);
      display: flex;
      gap: 0.75rem;
      margin: 2rem 0;
      padding: 1rem;
    }
    .processing p {
      color: var(--color-text-muted);
      margin: 0.2rem 0 0;
    }
    dl {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(3, 1fr);
      margin: 2rem 0;
    }
    dt {
      color: var(--color-text-muted);
      font-size: 0.85rem;
      margin-bottom: 0.3rem;
    }
    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
    .timeline {
      border-top: 2px dashed var(--color-border);
      padding-top: 1.5rem;
    }
    h2 {
      font-size: 1.35rem;
    }
    .timeline-item {
      align-items: center;
      display: flex;
      gap: 0.75rem;
      margin: 1rem 0;
    }
    .timeline-item > span {
      align-items: center;
      background: var(--color-cream-dark);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-badge);
      display: inline-flex;
      height: 1.8rem;
      justify-content: center;
      width: 1.8rem;
    }
    .timeline-item.complete > span {
      background: var(--color-status-success-bg);
      color: var(--color-success);
    }
    .timeline-item.failed > span {
      background: var(--color-status-error-bg);
      color: var(--color-error);
    }
    .timeline-item p {
      color: var(--color-text-muted);
      font-size: 0.85rem;
      margin: 0.15rem 0 0;
    }
    .error-message {
      background: var(--color-status-error-bg);
      border: 1px solid var(--color-error);
      border-radius: var(--radius-control);
      color: var(--color-error);
      margin: 1.5rem 0 0;
      padding: 0.85rem;
    }
    .feedback {
      display: grid;
      gap: 1rem;
      margin: 0 auto;
      max-width: 46rem;
      padding: 1.25rem;
    }
    .feedback p {
      margin: 0;
    }
    @media (max-width: 600px) {
      dl {
        grid-template-columns: 1fr;
      }
    }
  `,
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
