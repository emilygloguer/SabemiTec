import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePaymentRequest, Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${environment.apiUrl}/pagamentos`);
  }

  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${environment.apiUrl}/pagamentos/${id}`);
  }

  createPayment(request: CreatePaymentRequest, apiKey: string): Observable<Payment> {
    return this.http.post<Payment>(`${environment.apiUrl}/pagamentos`, request, {
      headers: new HttpHeaders({ 'X-Api-Key': apiKey }),
    });
  }
}
