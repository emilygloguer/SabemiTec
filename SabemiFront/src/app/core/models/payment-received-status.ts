export type PaymentReceivedStatus = 'Sucesso' | 'Erro';

export function normalizePaymentReceivedStatus(
  status: string | null | undefined,
): PaymentReceivedStatus | null {
  switch (status?.trim().toLocaleLowerCase()) {
    case 'pago':
    case 'sucesso':
      return 'Sucesso';
    case 'erro':
      return 'Erro';
    default:
      return null;
  }
}
