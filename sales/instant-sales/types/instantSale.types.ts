export interface InstantSale {
  orderId: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  address: string;

  baseAmount: number;
  deliveryCharges: number;
  cgstPercent: number;
  sgstPercent: number;
  totalAmount: number;
  remainingAmount: number;

  paidAmount: number;
  paymentStatus: 'Pending' | 'Partially Paid' | 'Paid';

  saleDate: string;
  deliveredAt: string;

  deliveryStatus: 'Delivered' | 'Cancelled';
  cancelledAt?: string;
  cancellationReason?: string;

  notes?: string;
  items: InstantSaleItem[];

  createdAt: string;
  createdBy: string;
}

export interface InstantSaleItem {
  itemNumber: number;
  plantName: string;
  batchCode?: string;
  quantity: number;
  unitAmount: number;
  stockSource: 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR';
  sourceStage?: string;
  sourcePhase?: string;
  lineTotal: number;
}

export interface CreateInstantSaleRequest {
  customerId: string;
  saleDate?: string;
  notes?: string;
  deliveryCharges?: number;
  cgstPercent?: number;
  sgstPercent?: number;
  createdBy: string;
  items: {
    plantName: string;
    batchCode: string;
    quantity: number;
    unitAmount: number;
    stockSource: 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR';
  }[];
}

export interface UpdateInstantSaleRequest {
  deliveryCharges?: number;
  cgstPercent?: number;
  sgstPercent?: number;
  items?: {
    unitAmount: number;
  }[];
}

export interface CancelInstantSaleRequest {
  cancellationReason: string;
}
