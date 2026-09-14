import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-payment-summary',
  templateUrl: './payment-summary.component.html',
  styleUrl: './payment-summary.component.scss',
})
export class PaymentSummaryComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number;
  @Input() variant: 'neutral' | 'processing' | 'success' | 'error' = 'neutral';
}
