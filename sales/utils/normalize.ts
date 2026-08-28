import type { BankAccount, Customer, DashboardStats, LedgerEntry } from '../types';

export function pick<T>(raw: Record<string, unknown>, camel: string, snake: string): T | undefined {
  if (raw[camel] !== undefined) return raw[camel] as T;
  if (raw[snake] !== undefined) return raw[snake] as T;
  return undefined;
}

export function normalizeCustomer(raw: Record<string, unknown>): Customer {
  return {
    customer_id: String(pick(raw, 'customerId', 'customer_id') ?? ''),
    name: String(raw.name ?? ''),
    phone_number: (pick<string | null>(raw, 'phoneNumber', 'phone_number') ?? null),
    address: (pick<string | null>(raw, 'address', 'address') ?? null),
    is_deleted: Boolean(pick(raw, 'isDeleted', 'is_deleted') ?? false),
    created_at: String(pick(raw, 'createdAt', 'created_at') ?? ''),
  };
}

export function normalizeBankAccount(raw: Record<string, unknown>): BankAccount {
  return {
    id: Number(raw.id ?? 0),
    account_name: String(pick(raw, 'accountName', 'account_name') ?? ''),
    account_number: String(pick(raw, 'accountNumber', 'account_number') ?? ''),
    bank_name: String(pick(raw, 'bankName', 'bank_name') ?? ''),
    branch: String(raw.branch ?? ''),
    ifsc_code: String(pick(raw, 'ifscCode', 'ifsc_code') ?? ''),
    is_active: Boolean(pick(raw, 'isActive', 'is_active') ?? true),
    total_credits: Number(pick(raw, 'totalCredits', 'total_credits') ?? 0),
    total_debits: Number(pick(raw, 'totalDebits', 'total_debits') ?? 0),
    created_at: pick<string>(raw, 'createdAt', 'created_at'),
  };
}

export function normalizeLedgerEntry(raw: Record<string, unknown>): LedgerEntry {
  return {
    id: Number(raw.id ?? 0),
    transaction_number: String(pick(raw, 'transactionNumber', 'transaction_number') ?? ''),
    entry_date: String(pick(raw, 'entryDate', 'entry_date') ?? ''),
    entry_type: String(pick(raw, 'entryType', 'entry_type') ?? ''),
    entry_direction: (pick(raw, 'entryDirection', 'entry_direction') ?? 'CREDIT') as LedgerEntry['entry_direction'],
    debit_amount: Number(pick(raw, 'debitAmount', 'debit_amount') ?? 0),
    credit_amount: Number(pick(raw, 'creditAmount', 'credit_amount') ?? 0),
    payment_method: pick(raw, 'paymentMethod', 'payment_method') as LedgerEntry['payment_method'],
    payment_reference: pick(raw, 'paymentReference', 'payment_reference') as string | undefined,
    notes: pick(raw, 'notes', 'notes') as string | undefined,
    order_id: pick(raw, 'orderId', 'order_id') as string | undefined,
    bank_account_id: pick<number>(raw, 'bankAccountId', 'bank_account_id'),
    bank_account_name: pick(raw, 'bankAccountName', 'bank_account_name') as string | undefined,
    customer_name: pick(raw, 'customerName', 'customer_name') as string | undefined,
  };
}

export function normalizeDashboardStats(raw: Record<string, unknown>): DashboardStats {
  return {
    net_inflow: Number(pick(raw, 'netInflow', 'net_inflow') ?? 0),
    net_outflow: Number(pick(raw, 'netOutflow', 'net_outflow') ?? 0),
    total_indoor_bottles: Number(pick(raw, 'totalIndoorBottles', 'total_indoor_bottles') ?? 0),
    total_outdoor_plants: Number(pick(raw, 'totalOutdoorPlants', 'total_outdoor_plants') ?? 0),
  };
}

export function normalizeStockRow(raw: Record<string, unknown>) {
  return {
    batch_code: String(pick(raw, 'batchCode', 'batch_code') ?? ''),
    plant_name: String(pick(raw, 'plantName', 'plant_name') ?? ''),
    stage: pick(raw, 'stage', 'stage'),
    phase: pick(raw, 'phase', 'phase'),
    lab_number: pick<number>(raw, 'labNumber', 'lab_number'),
    available_bottles: Number(pick(raw, 'availableBottles', 'available_bottles') ?? pick(raw, 'qtyAvailable', 'qty_available') ?? 0),
    current_phase: pick(raw, 'currentPhase', 'current_phase'),
    phase_name: pick(raw, 'phaseName', 'phase_name') ?? pick(raw, 'currentPhase', 'current_phase'),
    current_tunnel: pick(raw, 'currentTunnel', 'current_tunnel'),
    available_plants: Number(pick(raw, 'availablePlants', 'available_plants') ?? pick(raw, 'bookablePlants', 'bookable_plants') ?? 0),
    bookable_plants: Number(pick(raw, 'bookablePlants', 'bookable_plants') ?? pick(raw, 'availablePlants', 'available_plants') ?? 0),
  };
}

export function normalizePreBookingItem(raw: Record<string, unknown>) {
  return {
    item_number: Number(pick(raw, 'itemNumber', 'item_number') ?? 0),
    plant_name: String(pick(raw, 'plantName', 'plant_name') ?? ''),
    quantity: Number(raw.quantity ?? 0),
    unit_amount: Number(pick(raw, 'unitAmount', 'unit_amount') ?? 0),
    stock_source: pick(raw, 'stockSource', 'stock_source') as 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR',
    source_stage: pick(raw, 'sourceStage', 'source_stage') as string | undefined,
    source_phase: pick(raw, 'sourcePhase', 'source_phase') as string | undefined,
    batch_code: pick<string | null>(raw, 'batchCode', 'batch_code') ?? null,
    delivered_quantity: Number(pick(raw, 'deliveredQuantity', 'delivered_quantity') ?? 0),
    delivery_status: pick(raw, 'deliveryStatus', 'delivery_status') as 'Pending' | 'Partially Delivered' | 'Delivered' | undefined,
    line_total: Number(pick(raw, 'lineTotal', 'line_total') ?? 0),
  };
}

export function normalizePreBooking(raw: Record<string, unknown>) {
  const items = Array.isArray(raw.items)
    ? raw.items.map((item) => normalizePreBookingItem(item as Record<string, unknown>))
    : [];

  return {
    order_id: String(pick(raw, 'orderId', 'order_id') ?? ''),
    customer_id: String(pick(raw, 'customerId', 'customer_id') ?? ''),
    customer_name: String(pick(raw, 'customerName', 'customer_name') ?? ''),
    phone_number: String(pick(raw, 'phoneNumber', 'phone_number') ?? ''),
    address: String(raw.address ?? ''),
    base_amount: Number(pick(raw, 'baseAmount', 'base_amount') ?? 0),
    delivery_charges: Number(pick(raw, 'deliveryCharges', 'delivery_charges') ?? 0),
    cgst_percent: Number(pick(raw, 'cgstPercent', 'cgst_percent') ?? 0),
    sgst_percent: Number(pick(raw, 'sgstPercent', 'sgst_percent') ?? 0),
    total_amount: Number(pick(raw, 'totalAmount', 'total_amount') ?? 0),
    remaining_amount: Number(pick(raw, 'remainingAmount', 'remaining_amount') ?? 0),
    paid_amount: Number(pick(raw, 'paidAmount', 'paid_amount') ?? 0),
    amount_paid_at_booking: Number(pick(raw, 'amountPaidAtBooking', 'amount_paid_at_booking') ?? 0),
    payment_status: pick(raw, 'paymentStatus', 'payment_status') as 'Pending' | 'Partially Paid' | 'Paid',
    booking_date: String(pick(raw, 'bookingDate', 'booking_date') ?? ''),
    expected_delivery_date: pick(raw, 'expectedDeliveryDate', 'expected_delivery_date') as string | undefined,
    delivered_at: pick(raw, 'deliveredAt', 'delivered_at') as string | undefined,
    delivery_status: pick(raw, 'deliveryStatus', 'delivery_status') as PreBooking['delivery_status'],
    cancelled_at: pick(raw, 'cancelledAt', 'cancelled_at') as string | undefined,
    cancellation_reason: pick(raw, 'cancellationReason', 'cancellation_reason') as string | undefined,
    notes: pick(raw, 'notes', 'notes') as string | undefined,
    items,
    created_at: String(pick(raw, 'createdAt', 'created_at') ?? ''),
    created_by: String(pick(raw, 'createdBy', 'created_by') ?? ''),
  };
}

export function normalizePreBookingStats(raw: Record<string, unknown>) {
  return {
    pending_deliveries: Number(pick(raw, 'pendingDeliveries', 'pending_deliveries') ?? 0),
    outstanding_amount: Number(pick(raw, 'outstandingAmount', 'outstanding_amount') ?? 0),
  };
}

export function normalizeInstantSaleItem(raw: Record<string, unknown>) {
  return {
    item_number: Number(pick(raw, 'itemNumber', 'item_number') ?? 0),
    plant_name: String(pick(raw, 'plantName', 'plant_name') ?? ''),
    batch_code: pick<string | undefined>(raw, 'batchCode', 'batch_code'),
    quantity: Number(raw.quantity ?? 0),
    unit_amount: Number(pick(raw, 'unitAmount', 'unit_amount') ?? 0),
    stock_source: pick(raw, 'stockSource', 'stock_source') as 'STOCK_FROM_INDOOR' | 'STOCK_FROM_OUTDOOR',
    source_stage: pick(raw, 'sourceStage', 'source_stage') as string | undefined,
    source_phase: pick(raw, 'sourcePhase', 'source_phase') as string | undefined,
    line_total: Number(pick(raw, 'lineTotal', 'line_total') ?? 0),
  };
}

export function normalizeInstantSale(raw: Record<string, unknown>) {
  const items = Array.isArray(raw.items)
    ? raw.items.map((item) => normalizeInstantSaleItem(item as Record<string, unknown>))
    : [];

  return {
    order_id: String(pick(raw, 'orderId', 'order_id') ?? ''),
    customer_id: String(pick(raw, 'customerId', 'customer_id') ?? ''),
    customer_name: String(pick(raw, 'customerName', 'customer_name') ?? ''),
    phone_number: String(pick(raw, 'phoneNumber', 'phone_number') ?? ''),
    address: String(raw.address ?? ''),
    base_amount: Number(pick(raw, 'baseAmount', 'base_amount') ?? 0),
    delivery_charges: Number(pick(raw, 'deliveryCharges', 'delivery_charges') ?? 0),
    cgst_percent: Number(pick(raw, 'cgstPercent', 'cgst_percent') ?? 0),
    sgst_percent: Number(pick(raw, 'sgstPercent', 'sgst_percent') ?? 0),
    total_amount: Number(pick(raw, 'totalAmount', 'total_amount') ?? 0),
    remaining_amount: Number(pick(raw, 'remainingAmount', 'remaining_amount') ?? 0),
    paid_amount: Number(pick(raw, 'paidAmount', 'paid_amount') ?? 0),
    payment_status: pick(raw, 'paymentStatus', 'payment_status') as 'Pending' | 'Partially Paid' | 'Paid',
    sale_date: String(pick(raw, 'saleDate', 'sale_date') ?? ''),
    delivered_at: String(pick(raw, 'deliveredAt', 'delivered_at') ?? ''),
    delivery_status: pick(raw, 'deliveryStatus', 'delivery_status') as 'Delivered' | 'Cancelled',
    cancelled_at: pick(raw, 'cancelledAt', 'cancelled_at') as string | undefined,
    cancellation_reason: pick(raw, 'cancellationReason', 'cancellation_reason') as string | undefined,
    notes: pick(raw, 'notes', 'notes') as string | undefined,
    items,
    created_at: String(pick(raw, 'createdAt', 'created_at') ?? ''),
    created_by: String(pick(raw, 'createdBy', 'created_by') ?? ''),
  };
}

export function normalizeInstantSaleStats(raw: Record<string, unknown>) {
  return {
    total_sales: Number(pick(raw, 'totalSales', 'total_sales') ?? 0),
    outstanding_amount: Number(pick(raw, 'outstandingAmount', 'outstanding_amount') ?? 0),
  };
}

export function normalizeBookingPayment(raw: Record<string, unknown>) {
  return {
    id: Number(raw.id ?? 0),
    transaction_number: String(pick(raw, 'transactionNumber', 'transaction_number') ?? ''),
    order_id: String(pick(raw, 'orderId', 'order_id') ?? ''),
    entry_date: String(pick(raw, 'entryDate', 'entry_date') ?? ''),
    credit_amount: Number(pick(raw, 'creditAmount', 'credit_amount') ?? 0),
    payment_method: pick(raw, 'paymentMethod', 'payment_method') as 'Cash' | 'Card' | 'NEFT' | 'UPI' | 'Cheque',
    bank_account_id: pick<number | null>(raw, 'bankAccountId', 'bank_account_id') ?? null,
    bank_account_name: pick<string | null>(raw, 'bankAccountName', 'bank_account_name') ?? null,
    payment_reference: pick(raw, 'paymentReference', 'payment_reference') as string | undefined,
    notes: pick(raw, 'notes', 'notes') as string | undefined,
    entry_type: String(pick(raw, 'entryType', 'entry_type') ?? ''),
    customer_name: pick(raw, 'customerName', 'customer_name') as string | undefined,
  };
}
