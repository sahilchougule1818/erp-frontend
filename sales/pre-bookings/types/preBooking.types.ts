export interface PreBooking {
  order_id: string;
  customer_id: string;
  customer_name: string;
  phone_number: string;
  address: string;
  
  base_amount: number;
  delivery_charges: number;
  cgst_percent: number;
  sgst_percent: number;
  total_amount: number;
  remaining_amount: number;
  
  paid_amount: number;
  amount_paid_at_booking: number;
  payment_status: 'Pending' | 'Partially Paid' | 'Paid';
  
  booking_date: string;
  expected_delivery_date?: string;
  delivered_at?: string;
  
  delivery_status: 'Pending' | 'Partially Delivered' | 'Delivered' | 'Cancelled';
  cancelled_at?: string;
  cancellation_reason?: string;
  
  notes?: string;
  items: PreBookingItem[];
  
  created_at: string;
  created_by: string;
}

export interface PreBookingItem {
  item_number: number;
  plant_name: string;
  quantity: number;
  unit_amount: number;
  stock_source: 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR';
  source_stage?: string;
  source_phase?: string;
  batch_code?: string | null;
  delivered_quantity?: number;
  delivery_status?: 'Pending' | 'Partially Delivered' | 'Delivered';
  line_total: number;
}

export interface CreatePreBookingRequest {
  customer_id: string;
  booking_date?: string;
  expected_delivery_date?: string;
  notes?: string;
  delivery_charges?: number;
  cgst_percent?: number;
  sgst_percent?: number;
  created_by: string;
  items: {
    plant_name: string;
    quantity: number;
    unit_amount: number;
    stock_source: 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR';
  }[];
}

export interface UpdatePreBookingRequest {
  booking_date?: string;
  expected_delivery_date?: string;
  notes?: string;
  delivery_charges?: number;
  cgst_percent?: number;
  sgst_percent?: number;
  items?: {
    plant_name: string;
    quantity: number;
    unit_amount: number;
    stock_source: 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR';
  }[];
}

export interface DeliverPreBookingRequest {
  items_with_batches: {
    item_number: number;
    batch_code: string;
    quantity: number;
  }[];
}

export interface UndeliverPreBookingRequest {
  item_number?: number;
}

export interface CancelPreBookingRequest {
  cancellation_reason: string;
}
