import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';

export interface PaymentResultOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-payment-result-select',
  template: `
    <div class="select-wrapper">
      <button
        type="button"
        class="select-trigger"
        role="combobox"
        [attr.aria-label]="ariaLabel"
        [attr.aria-expanded]="open"
        [attr.aria-controls]="listId"
        [attr.aria-activedescendant]="open && activeIndex >= 0 ? optionId(activeIndex) : null"
        (click)="toggle()"
        (keydown)="onKeydown($event)"
      >
        <span>{{ selectedLabel }}</span>
        <svg aria-hidden="true" viewBox="0 0 14 14">
          <path d="m3 5 4 4 4-4" />
        </svg>
      </button>
      @if (open) {
        <div class="options-panel" [id]="listId" role="listbox" [attr.aria-label]="ariaLabel">
          @for (option of options; track option.value; let index = $index) {
            <button
              type="button"
              class="option"
              role="option"
              tabindex="-1"
              [id]="optionId(index)"
              [class.active]="activeIndex === index"
              [class.selected]="value === option.value"
              [attr.aria-selected]="value === option.value"
              (mousedown)="$event.preventDefault()"
              (mouseenter)="activeIndex = index"
              (click)="select(option)"
            >
              <span>{{ option.label }}</span>
              @if (value === option.value) {
                <span class="check" aria-hidden="true">✓</span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .select-wrapper {
      position: relative;
    }
    .select-trigger {
      align-items: center;
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-control);
      color: var(--color-text);
      cursor: pointer;
      display: flex;
      font: inherit;
      justify-content: space-between;
      min-height: 2.75rem;
      padding: 0.6rem 0.75rem;
      text-align: left;
      width: 100%;
    }
    .select-trigger:focus-visible {
      border-color: var(--color-primary);
      outline: 2px solid var(--color-focus-ring);
    }
    .select-trigger svg {
      fill: none;
      flex: 0 0 auto;
      height: 0.875rem;
      margin-left: 0.75rem;
      stroke: var(--color-text-muted);
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.5;
      width: 0.875rem;
    }
    .options-panel {
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-control);
      box-shadow: var(--shadow-soft);
      left: 0;
      max-height: 14rem;
      overflow-y: auto;
      padding: 0.3rem;
      position: absolute;
      top: calc(100% + 0.3rem);
      width: 100%;
      z-index: 20;
    }
    .option {
      align-items: center;
      background: transparent;
      border: 0;
      border-radius: var(--radius-badge);
      color: var(--color-text);
      cursor: pointer;
      display: flex;
      font: inherit;
      justify-content: space-between;
      min-height: 2.5rem;
      padding: 0.55rem 0.75rem;
      text-align: left;
      width: 100%;
    }
    .option:hover,
    .option.active {
      background: var(--color-background);
    }
    .option.selected {
      color: var(--color-primary-dark);
      font-weight: 700;
    }
    .check {
      color: var(--color-success);
      margin-left: 0.75rem;
    }
  `,
})
export class PaymentResultSelectComponent {
  private static nextId = 0;
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly listId = `payment-result-options-${PaymentResultSelectComponent.nextId++}`;

  @Input() ariaLabel = 'Status do pagamento';
  @Input() options: PaymentResultOption[] = [];
  @Input() placeholder = 'Selecione o status';
  @Input() value = '';
  @Output() readonly valueChange = new EventEmitter<string>();

  open = false;
  activeIndex = -1;

  get selectedLabel(): string {
    return this.options.find((option) => option.value === this.value)?.label ?? this.placeholder;
  }

  toggle(): void {
    this.open = !this.open;
    this.activeIndex = this.open ? this.selectedIndexOrFirst : -1;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveActiveOption(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Home' && this.open) {
      event.preventDefault();
      this.activeIndex = 0;
      return;
    }

    if (event.key === 'End' && this.open) {
      event.preventDefault();
      this.activeIndex = this.options.length - 1;
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.open) {
        this.open = true;
        this.activeIndex = this.selectedIndexOrFirst;
      } else if (this.options[this.activeIndex]) {
        this.select(this.options[this.activeIndex]);
      }
      return;
    }

    if (event.key === 'Tab' && this.open) {
      this.close();
      return;
    }

    if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      this.close();
    }
  }

  optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  select(option: PaymentResultOption): void {
    this.valueChange.emit(option.value);
    this.close();
  }

  @HostListener('document:click', ['$event'])
  closeWhenClickingOutside(event: MouseEvent): void {
    if (this.open && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  private get selectedIndexOrFirst(): number {
    const selectedIndex = this.options.findIndex((option) => option.value === this.value);
    return selectedIndex >= 0 ? selectedIndex : this.options.length ? 0 : -1;
  }

  private moveActiveOption(offset: number): void {
    if (!this.options.length) return;

    if (!this.open) {
      this.open = true;
      this.activeIndex = offset > 0 ? this.selectedIndexOrFirst : this.options.length - 1;
      return;
    }

    this.activeIndex = Math.max(0, Math.min(this.options.length - 1, this.activeIndex + offset));
  }

  private close(): void {
    this.open = false;
    this.activeIndex = -1;
  }
}
