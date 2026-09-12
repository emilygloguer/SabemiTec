import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `<div class="loading" role="status"><span></span>{{ message }}</div>`,
  styles: `
    .loading {
      align-items: center;
      color: var(--color-text-muted);
      display: flex;
      gap: 0.65rem;
      padding: 2rem 0;
    }
    span {
      animation: pulse 1s infinite alternate;
      background: var(--color-primary);
      border-radius: 50%;
      height: 0.7rem;
      width: 0.7rem;
    }
    @keyframes pulse {
      to {
        opacity: 0.35;
        transform: scale(0.7);
      }
    }
  `,
})
export class LoadingComponent {
  @Input() message = 'Carregando pagamentos...';
}
