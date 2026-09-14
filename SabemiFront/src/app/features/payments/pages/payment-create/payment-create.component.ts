import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
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
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.scss',
})
export class PaymentCreateComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly amountInCents = signal(0);
  readonly amountDisplay = signal(this.formatCurrency(0));
  private readonly currentDateTime = this.currentBrazilianDateTime();
  readonly maxPaymentDateTime = `${this.currentDateTime.slice(0, 10)}T23:59`;
  readonly statusOptions: PaymentResultOption[] = [
    { value: 'Sucesso', label: 'Sucesso' },
    { value: 'Erro', label: 'Erro' },
  ];
  private readonly paymentDateValidator: ValidatorFn = (control) => {
    const selectedDate = control.value;
    if (typeof selectedDate !== 'string' || selectedDate.length < 10) return null;

    const selectedDay = selectedDate.slice(0, 10);
    const today = this.currentDateTime.slice(0, 10);

    return selectedDay > today ? { futureDate: true } : null;
  };
  readonly form = this.formBuilder.group({
    transactionId: ['', Validators.required],
    contractId: ['', Validators.required],
    paymentDate: [this.currentDateTime, [Validators.required, this.paymentDateValidator]],
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
