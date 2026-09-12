import { PaymentStatus } from './payment-status';

export interface Payment {
  id: string;
  transacaoId: string | null;
  contratoId: string | null;
  valor: number | null;
  dataPagamento: string | null;
  statusRecebido: string | null;
  statusProcessamento: PaymentStatus;
  mensagemErro: string | null;
  dataRecebimento: string;
  dataProcessamento: string | null;
}

export interface CreatePaymentRequest {
  id_transacao: string;
  id_contrato: string;
  valor: number;
  data_pagamento: string;
  status: string;
}
