export type BankAccount = {
  id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  branch: string;
  ifsc_code: string;
  is_active: boolean;
  total_credits: number;
  total_debits: number;
  created_at?: string;
};

export type BookingAllocation = {
  batch_code: string;
  plant_name?: string;
  quantity: number;
  is_terminal_incubation?: boolean;
  source_table?: 'incubation_records' | 'rooted_batches';
  source_phase?: string;
  source_record_id?: number;
  schema?: 'indoor' | 'outdoor';
};

export type OrderItem = {
  id?: number;
  item_number: number;
  plant_name: string;
  quantity: number;
  unit_amount: number;
  total_price?: number;  // Computed on backend, optional in frontend
  allocations?: BookingAllocation[];
};

export type Booking = {
  id?: number;
  order_id: string;
  customer_name: string;
  phone_number: string;
  address: string;
  items: OrderItem[];
  total_amount: number;
  amount_paid_at_booking: number;
  paid_amount: number;
  remaining_amount: number;
  order_date: string;
  expected_delivery_date?: string | null;
  fulfillment_type?: 'STOCK_FROM_OUTDOOR' | 'STOCK_FROM_INDOOR';
  payment_status: 'Paid' | 'Partially Paid' | 'Pending';
  delivery_status: 'Pending' | 'Delivered' | 'Cancelled';
  notes?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  is_instant_sell?: boolean;
  created_at?: string;
};

export type BookingPayment = {
  id: number;
  transaction_number: string;
  order_id: string;
  entry_date: string;
  credit_amount: number;
  payment_method: 'Cash' | 'Card' | 'NEFT' | 'UPI' | 'Cheque';
  bank_account_id?: number | null;
  bank_account_name?: string | null;
  payment_reference?: string;
  notes?: string;
  entry_type: string;
  customer_name?: string;
};

export type LedgerEntry = {
  id: number;
  transaction_number: string;
  entry_date: string;
  entry_type: string;
  entry_direction: 'CREDIT' | 'DEBIT';
  debit_amount: number;
  credit_amount: number;
  bank_account_id?: number;
  bank_account_name?: string;
  bank_name?: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  order_id?: string;
  refund_id?: string;
  refund_term_no?: number;
  stock_purchase_id?: string;
  is_deleted: boolean;
  created_at: string;
  created_by?: string;
};

export type WithdrawEntry = {
  id?: number;
  purchase_id: string;
  withdraw_date: string;
  amount: number;
  quantity?: number | null;
  bank_account_id: number;
  item_id: number;
  item_name?: string;
  item_unit?: string;
  supplier_id?: number;
  supplier_name?: string;
  payment_method: string;
  transaction_number?: string;
  payment_reference?: string;
  purpose: string;
  notes?: string;
  is_locked?: boolean;
};

export type Refund = {
  refund_id: string;
  order_id: string;
  customer_name?: string;
  phone_number?: string;
  product_type?: string;
  cancelled_quantity?: number;
  refund_amount: number;
  amount_paid: number;
  amount_remaining: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  total_terms: number;
  refund_reason?: string;
  created_at?: string;
};

export type RefundPayment = {
  transaction_number: string;
  refund_term_no: number;
  debit_amount: number;
  entry_date: string;
  payment_method: string;
  bank_account_id?: number;
  bank_account_name?: string;
  payment_reference?: string;
  notes?: string;
  created_at?: string;
};

export type RefundDetail = Refund & {
  payments: RefundPayment[];
};

export type InventoryItem = {
  id: number;
  name: string;
  unit: string;
  category: string;
};

export type Supplier = {
  id: number;
  name: string;
  contact?: string;
};

export type DashboardStats = {
  net_inflow: number;
  net_outflow: number;
  net_pending: number;
  total_indoor_bottles: number;
  total_outdoor_plants: number;
};

export type UpcomingDelivery = {
  order_id: string;
  customer_id: string;
  customer_name: string;
  plant_name: string;
  quantity: number;
  expected_delivery_date: string;
};

export type Customer = {
  customer_id: string;
  name: string;
  phone_number: string | null;
  address: string | null;
  is_deleted: boolean;
  created_at: string;
};
