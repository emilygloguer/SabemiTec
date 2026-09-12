import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LadybugIconComponent } from '../ladybug-icon/ladybug-icon.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, LadybugIconComponent],
  template: `<header>
    <a routerLink="/payments" aria-label="Sabemi Pay - pagamentos"
      ><app-ladybug-icon /><span class="wordmark">Sabemi <strong>Pay</strong></span></a
    >
  </header>`,
  styles: `
    header {
      background: var(--color-success);
    }
    header::after {
      background: repeating-linear-gradient(
        90deg,
        var(--color-primary) 0 0.45rem,
        var(--color-surface) 0.45rem 0.9rem
      );
      content: '';
      display: block;
      height: 0.35rem;
    }
    a {
      align-items: center;
      color: var(--color-surface);
      display: flex;
      font-family: Georgia, serif;
      font-size: 2rem;
      gap: 0.8rem;
      margin: 0 auto;
      max-width: 1200px;
      padding: 0.85rem 1.5rem;
      text-decoration: none;
    }
    strong {
      color: var(--color-primary);
    }
    app-ladybug-icon {
      transform: scale(1.25);
      transform-origin: center;
    }
    .wordmark {
      letter-spacing: -0.06em;
      line-height: 1;
    }
    @media (max-width: 500px) {
      a {
        font-size: 1.65rem;
      }
    }
  `,
})
export class HeaderComponent {}
