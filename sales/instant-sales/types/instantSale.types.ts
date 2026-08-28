export interface InstantSale {
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
  payment_status: 'Pending' | 'Partially Paid' | 'Paid';
  
  sale_date: string;
  delivered_at: string;
  
  delivery_status: 'Delivered' | 'Cancelled';
  cancelled_at?: string;
  cancellation_reason?: string;
  
  notes?: string;
  items: InstantSaleItem[];
  
  created_at: string;
  created_by: string;
}

export interface InstantSaleItem {
  item_number: number;
  plant_name: string;
  batch_code?: string;
  quantity: number;
  unit_amount: number;
  stock_source: 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR';
  source_stage?: string;
  source_phase?: string;
  line_total: number;
}

export interface CreateInstantSaleRequest {
  customer_id: string;
  sale_date?: string;
  notes?: string;
  delivery_charges?: number;
  cgst_percent?: number;
  sgst_percent?: number;
  created_by: string;
  items: {
    plant_name: string;
    batch_code: string;
    quantity: number;
    unit_amount: number;
    stock_source: 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR';
  }[];
}

export interface UpdateInstantSaleRequest {
  delivery_charges?: number;
  cgst_percent?: number;
  sgst_percent?: number;
  items?: {
    unit_amount: number;
  }[];
}

export interface CancelInstantSaleRequest {
  cancellation_reason: string;
}
