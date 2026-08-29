export interface PreBooking {
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
  amountPaidAtBooking: number;
  paymentStatus: 'Pending' | 'Partially Paid' | 'Paid';

  bookingDate: string;
  expectedDeliveryDate?: string;
  deliveredAt?: string;

  deliveryStatus: 'Pending' | 'Partially Delivered' | 'Delivered' | 'Cancelled';
  cancelledAt?: string;
  cancellationReason?: string;

  notes?: string;
  items: PreBookingItem[];

  createdAt: string;
  createdBy: string;
}

export interface PreBookingItem {
  itemNumber: number;
  plantName: string;
  quantity: number;
  unitAmount: number;
  stockSource: 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR';
  sourceStage?: string;
  sourcePhase?: string;
  batchCode?: string | null;
  deliveredQuantity?: number;
  deliveryStatus?: 'Pending' | 'Partially Delivered' | 'Delivered';
  lineTotal: number;
}

export interface CreatePreBookingRequest {
  customerId: string;
  bookingDate?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  deliveryCharges?: number;
  cgstPercent?: number;
  sgstPercent?: number;
  createdBy: string;
  items: {
    plantName: string;
    quantity: number;
    unitAmount: number;
    stockSource: 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR';
  }[];
}

export interface UpdatePreBookingRequest {
  bookingDate?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  deliveryCharges?: number;
  cgstPercent?: number;
  sgstPercent?: number;
  items?: {
    plantName: string;
    quantity: number;
    unitAmount: number;
    stockSource: 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR';
  }[];
}

export interface DeliverPreBookingRequest {
  itemsWithBatches: {
    itemNumber: number;
    batchCode: string;
    quantity: number;
  }[];
}

export interface UndeliverPreBookingRequest {
  itemNumber?: number;
}

export interface CancelPreBookingRequest {
  cancellationReason: string;
}
