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
  templateUrl: './payment-result-select.component.html',
  styleUrl: './payment-result-select.component.scss',
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
