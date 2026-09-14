import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Payment } from '../../../../core/models/payment.model';
import { normalizePaymentReceivedStatus } from '../../../../core/models/payment-received-status';
import { PaymentStatusComponent } from '../payment-status/payment-status.component';

@Component({
  selector: 'app-payment-card',
  imports: [CurrencyPipe, DatePipe, PaymentStatusComponent, RouterLink],
  templateUrl: './payment-card.component.html',
  styleUrl: './payment-card.component.scss',
})
export class PaymentCardComponent {
  @Input({ required: true }) payment!: Payment;

  get receivedStatus(): ReturnType<typeof normalizePaymentReceivedStatus> {
    return normalizePaymentReceivedStatus(this.payment.statusRecebido);
  }
}
