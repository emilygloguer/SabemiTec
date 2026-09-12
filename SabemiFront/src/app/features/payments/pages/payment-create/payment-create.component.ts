import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { CreatePaymentRequest } from '../../../../core/models/payment.model';
import { PaymentService } from '../../../../core/services/payment.service';
import { LadybugIconComponent } from '../../../../shared/components/ladybug-icon/ladybug-icon.component';
import {
  PaymentResultOption,
  PaymentResultSelectComponent,
} from '../../components/payment-result-select/payment-result-select.component';

@Component({
  selector: 'app-payment-create',
  imports: [LadybugIconComponent, PaymentResultSelectComponent, ReactiveFormsModule, RouterLink],
  template: `
    <a class="back" routerLink="/payments">← Pagamentos</a>
    <section class="form-card surface-card">
      <div class="form-title">
        <app-ladybug-icon />
        <div>
          <h1>Novo pagamento</h1>
          <p>Envie um webhook de pagamento para acompanhamento.</p>
        </div>
      </div>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="transactionId">ID da transação</label
          ><input id="transactionId" formControlName="transactionId" autocomplete="off" /><small
            >Identificador único da transação.</small
          >
        </div>
        <div class="field">
          <label for="contractId">ID do contrato</label
          ><input id="contractId" formControlName="contractId" autocomplete="off" />
        </div>
        <div class="field">
          <label for="amount">Valor</label>
          <input
            id="amount"
            class="currency-input"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            [value]="amountDisplay()"
            (focus)="selectAmount($event)"
            (input)="formatAmount($event)"
            aria-describedby="amount-help"
          />
          <small id="amount-help">Digite apenas os números do valor.</small>
        </div>
        <div class="field">
          <label for="paymentDate">Data do pagamento</label
          ><input id="paymentDate" type="datetime-local" formControlName="paymentDate" />
        </div>
        <div class="field">
          <label>Status do pagamento</label>
          <app-payment-result-select
            ariaLabel="Status do pagamento"
            [options]="statusOptions"
            [value]="form.controls.status.value"
            (valueChange)="form.controls.status.setValue($event)"
          />
        </div>
        @if (error()) {
          <p class="form-error" role="alert">{{ error() }}</p>
        }
        <div class="actions">
          <a class="button button-secondary" routerLink="/payments">Cancelar</a
          ><button
            class="button button-primary"
            type="submit"
            [disabled]="form.invalid || amountInCents() === 0 || submitting()"
          >
            {{ submitting() ? 'Criando...' : 'Criar pagamento' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: `
    .back {
      color: var(--color-primary);
      display: inline-block;
      font-weight: 700;
      margin-bottom: 1.5rem;
      text-decoration: none;
    }
    .form-card {
      margin: 0 auto;
      max-width: 42rem;
      padding: clamp(1.25rem, 4vw, 2.5rem);
    }
    .form-title {
      align-items: center;
      display: flex;
      gap: 0.8rem;
      margin-bottom: 2rem;
    }
    h1 {
      font-size: 2rem;
      margin: 0 0 0.3rem;
    }
    .form-title p {
      color: var(--color-text-muted);
      margin-bottom: 0;
    }
    form {
      display: grid;
      gap: 1.15rem;
    }
    .field {
      display: grid;
      gap: 0.4rem;
    }
    label {
      font-weight: 700;
    }
    input {
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-control);
      color: var(--color-text);
      min-height: 2.8rem;
      padding: 0.6rem 0.75rem;
    }
    .currency-input {
      font-variant-numeric: tabular-nums;
    }
    input:focus,
    select:focus {
      border-color: var(--color-primary);
      outline: 2px solid var(--color-focus-ring);
    }
    small {
      color: var(--color-text-muted);
    }
    .actions {
      display: flex;
      gap: 0.75rem;
      justify-content: end;
      margin-top: 0.5rem;
    }
    .form-error {
      color: var(--color-error);
      margin: 0;
    }
    @media (max-width: 500px) {
      .actions {
        flex-direction: column-reverse;
      }
      .actions .button {
        width: 100%;
      }
    }
  `,
})
export class PaymentCreateComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly amountInCents = signal(0);
  readonly amountDisplay = signal(this.formatCurrency(0));
  readonly statusOptions: PaymentResultOption[] = [
    { value: 'Sucesso', label: 'Sucesso' },
    { value: 'Erro', label: 'Erro' },
  ];
  readonly form = this.formBuilder.group({
    transactionId: ['', Validators.required],
    contractId: ['', Validators.required],
    paymentDate: [this.currentBrazilianDateTime(), Validators.required],
    status: ['', Validators.required],
  });

  selectAmount(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  formatAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const cents = Number(digits || '0');
    const formattedValue = this.formatCurrency(cents);

    this.amountInCents.set(cents);
    this.amountDisplay.set(formattedValue);
    input.value = formattedValue;
  }

  submit(): void {
    if (this.form.invalid || this.amountInCents() === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: CreatePaymentRequest = {
      id_transacao: value.transactionId.trim(),
      id_contrato: value.contractId.trim(),
      valor: this.amountInCents() / 100,
      data_pagamento: this.toBrazilianUtc(value.paymentDate),
      status: value.status.trim(),
    };

    this.submitting.set(true);
    this.error.set('');
    this.paymentService.createPayment(request, environment.demoApiKey).subscribe({
      next: (payment) => this.router.navigate(['/payments', payment.id]),
      error: (httpError) => {
        this.error.set(
          httpError.error?.message ?? 'Não foi possível criar o pagamento. Tente novamente.',
        );
        this.submitting.set(false);
      },
    });
  }

  private formatCurrency(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  }

  private currentBrazilianDateTime(): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts();
    const value = (type: Intl.DateTimeFormatPartTypes): string =>
      parts.find((part) => part.type === type)?.value ?? '';

    return `${value('year')}-${value('month')}-${value('day')}T${value('hour')}:${value('minute')}`;
  }

  private toBrazilianUtc(dateTime: string): string {
    return new Date(`${dateTime}:00-03:00`).toISOString();
  }
}
