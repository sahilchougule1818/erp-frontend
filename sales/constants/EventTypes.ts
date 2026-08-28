export const ENTRY_TYPES = {
  ADVANCE_RECEIVED:  'ADVANCE_IN',
  PAYMENT_RECEIVED:  'PAYMENT_IN',
  REFUND:            'REFUND_OUT',
  STOCK_PURCHASE:    'STOCK_PURCHASE_OUT',
} as const;

export type EntryType = keyof typeof ENTRY_TYPES;

export const FULFILLMENT_TYPES = {
  STOCK_FROM_OUTDOOR: 'STOCK_FROM_OUTDOOR',
  STOCK_FROM_INDOOR:  'STOCK_FROM_INDOOR',
} as const;

export type FulfillmentType = keyof typeof FULFILLMENT_TYPES;

export const PAYMENT_METHODS = ['Cash', 'Card', 'NEFT', 'UPI', 'Cheque'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];
