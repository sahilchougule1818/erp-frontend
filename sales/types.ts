export type BankAccount = {
  id: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  ifscCode: string;
  isActive: boolean;
  totalCredits: number;
  totalDebits: number;
  createdAt?: string;
};

export type BookingAllocation = {
  batchCode: string;
  plantName?: string;
  quantity: number;
  isTerminalIncubation?: boolean;
  sourceTable?: 'incubation_records' | 'rooted_batches';
  sourcePhase?: string;
  sourceRecordId?: number;
  schema?: 'indoor' | 'outdoor';
};

export type OrderItem = {
  id?: number;
  itemNumber: number;
  plantName: string;
  quantity: number;
  unitAmount: number;
  totalPrice?: number;
  allocations?: BookingAllocation[];
};

export type Booking = {
  id?: number;
  orderId: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  amountPaidAtBooking: number;
  paidAmount: number;
  remainingAmount: number;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  fulfillmentType?: 'STOCK_FROM_OUTDOOR' | 'STOCK_FROM_INDOOR';
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending';
  deliveryStatus: 'Pending' | 'Delivered' | 'Cancelled';
  notes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  isInstantSell?: boolean;
  createdAt?: string;
};

export type BookingPayment = {
  id: number;
  transactionNumber: string;
  orderId: string;
  entryDate: string;
  creditAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'NEFT' | 'UPI' | 'Cheque';
  bankAccountId?: number | null;
  bankAccountName?: string | null;
  paymentReference?: string;
  notes?: string;
  entryType: string;
  customerName?: string;
};

export type LedgerEntry = {
  id: number;
  transactionNumber: string;
  entryDate: string;
  entryType: string;
  entryDirection: 'CREDIT' | 'DEBIT';
  debitAmount: number;
  creditAmount: number;
  bankAccountId?: number;
  bankAccountName?: string;
  bankName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  orderId?: string;
  refundId?: string;
  refundTermNo?: number;
  stockPurchaseId?: string;
  isDeleted: boolean;
  createdAt: string;
  createdBy?: string;
};

export type WithdrawEntry = {
  id?: number;
  purchaseId: string;
  withdrawDate: string;
  amount: number;
  quantity?: number | null;
  bankAccountId: number;
  itemId: number;
  itemName?: string;
  itemUnit?: string;
  supplierId?: number;
  supplierName?: string;
  paymentMethod: string;
  transactionNumber?: string;
  paymentReference?: string;
  purpose: string;
  notes?: string;
  isLocked?: boolean;
};

export type Refund = {
  refundId: string;
  orderId: string;
  customerName?: string;
  phoneNumber?: string;
  productType?: string;
  cancelledQuantity?: number;
  refundAmount: number;
  amountPaid: number;
  amountRemaining: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  totalTerms: number;
  refundReason?: string;
  createdAt?: string;
};

export type RefundPayment = {
  transactionNumber: string;
  refundTermNo: number;
  debitAmount: number;
  entryDate: string;
  paymentMethod: string;
  bankAccountId?: number;
  bankAccountName?: string;
  paymentReference?: string;
  notes?: string;
  createdAt?: string;
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
  netInflow: number;
  netOutflow: number;
  netPending: number;
  totalIndoorBottles: number;
  totalOutdoorPlants: number;
};

export type UpcomingDelivery = {
  orderId: string;
  customerId: string;
  customerName: string;
  plantName: string;
  quantity: number;
  expectedDeliveryDate: string;
};

export type Customer = {
  customerId: string;
  name: string;
  phoneNumber: string | null;
  address: string | null;
  isDeleted: boolean;
  createdAt: string;
};
