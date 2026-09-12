import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-payment-summary',
  template: `<article class="summary surface-card" [class]="'summary surface-card ' + variant">
    <span>{{ label }}</span
    ><strong>{{ value }}</strong>
  </article>`,
  styles: `
    .summary {
      border-top: 0.45rem solid var(--color-border);
      display: grid;
      gap: 0.4rem;
      min-width: 0;
      padding: 1rem;
    }
    span {
      color: var(--color-text-muted);
      font-size: 0.85rem;
    }
    strong {
      font-family: Georgia, serif;
      font-size: 1.75rem;
    }
    .neutral {
      border-color: var(--color-text);
    }
    .neutral strong {
      color: var(--color-text);
    }
    .processing strong {
      color: var(--color-processing);
    }
    .processing {
      border-color: var(--color-processing);
      border-top-color: var(--color-processing);
    }
    .success strong {
      color: var(--color-success);
    }
    .success {
      border-color: var(--color-success);
      border-top-color: var(--color-success);
    }
    .error strong {
      color: var(--color-error);
    }
    .error {
      border-color: var(--color-error);
      border-top-color: var(--color-error);
    }
  `,
})
export class PaymentSummaryComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number;
  @Input() variant: 'neutral' | 'processing' | 'success' | 'error' = 'neutral';
}
