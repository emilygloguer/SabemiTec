import { Routes } from '@angular/router';
import { PaymentCreateComponent } from './features/payments/pages/payment-create/payment-create.component';
import { PaymentDetailsComponent } from './features/payments/pages/payment-details/payment-details.component';
import { PaymentListComponent } from './features/payments/pages/payment-list/payment-list.component';

export const routes: Routes = [
  { path: 'payments', component: PaymentListComponent, title: 'Pagamentos | Sabemi Pay' },
  { path: 'payments/new', component: PaymentCreateComponent, title: 'Novo pagamento | Sabemi Pay' },
  { path: 'payments/:id', component: PaymentDetailsComponent, title: 'Pagamento | Sabemi Pay' },
  { path: '', pathMatch: 'full', redirectTo: 'payments' },
  { path: '**', redirectTo: 'payments' },
];
