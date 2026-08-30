export type AppModule = 'indoor' | 'outdoor' | 'sales' | 'inventory' | 'reports' | 'admin';

export interface NavItem {
  id: string;
  label: string;
  page: string;
  breadcrumbs: string[];
  module: AppModule;
}

export interface NavGroup {
  id: string;
  label: string;
  module: AppModule;
  children?: NavItem[];
  page?: string;
  breadcrumbs?: string[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'indoor',
    label: 'Indoor Module',
    module: 'indoor',
    children: [
      { id: 'indoor-dashboard', label: 'Indoor Dashboard', page: 'indoor-dashboard', breadcrumbs: ['Indoor', 'Indoor Dashboard'], module: 'indoor' },
      { id: 'operator-master', label: 'Operator Master', page: 'operator-master', breadcrumbs: ['Indoor', 'Operator Master'], module: 'indoor' },
      { id: 'media-preparation', label: 'Media', page: 'media-preparation', breadcrumbs: ['Indoor', 'Media'], module: 'indoor' },
      { id: 'indoor-batch-master', label: 'Batch Master', page: 'indoor-batch-master', breadcrumbs: ['Indoor', 'Batch Master'], module: 'indoor' },
      { id: 'multiplication', label: 'Multiplication', page: 'multiplication', breadcrumbs: ['Indoor', 'Multiplication'], module: 'indoor' },
      { id: 'incubation', label: 'Incubation', page: 'incubation', breadcrumbs: ['Indoor', 'Incubation'], module: 'indoor' },
      { id: 'rooting', label: 'Rooting', page: 'rooting', breadcrumbs: ['Indoor', 'Rooting'], module: 'indoor' },
      { id: 'cleaning-record', label: 'Cleaning Record', page: 'cleaning-record', breadcrumbs: ['Indoor', 'Cleaning Record'], module: 'indoor' },
      { id: 'sampling', label: 'Sampling', page: 'sampling', breadcrumbs: ['Indoor', 'Sampling'], module: 'indoor' },
      { id: 'indoor-settings', label: 'Indoor Settings', page: 'indoor-settings', breadcrumbs: ['Indoor', 'Indoor Settings'], module: 'indoor' },
    ],
  },
  {
    id: 'outdoor',
    label: 'Outdoor Module',
    module: 'outdoor',
    children: [
      { id: 'outdoor-dashboard', label: 'Outdoor Dashboard', page: 'outdoor-dashboard', breadcrumbs: ['Outdoor', 'Dashboard'], module: 'outdoor' },
      { id: 'outdoor-operator-master', label: 'Worker Master', page: 'outdoor-operator-master', breadcrumbs: ['Outdoor', 'Worker Master'], module: 'outdoor' },
      { id: 'batch-master', label: 'Batch Master', page: 'batch-master', breadcrumbs: ['Outdoor', 'Batch Master'], module: 'outdoor' },
      { id: 'primary-hardening', label: 'Primary Hardening', page: 'primary-hardening', breadcrumbs: ['Outdoor', 'Primary Hardening'], module: 'outdoor' },
      { id: 'secondary-hardening', label: 'Secondary Hardening', page: 'secondary-hardening', breadcrumbs: ['Outdoor', 'Secondary Hardening'], module: 'outdoor' },
      { id: 'shifting', label: 'Shifting Records', page: 'shifting', breadcrumbs: ['Outdoor', 'Shifting Records'], module: 'outdoor' },
      { id: 'holding-area', label: 'Holding Area', page: 'holding-area', breadcrumbs: ['Outdoor', 'Holding Area'], module: 'outdoor' },
      { id: 'outdoor-mortality', label: 'Outdoor Mortality', page: 'outdoor-mortality', breadcrumbs: ['Outdoor', 'Outdoor Mortality'], module: 'outdoor' },
      { id: 'fertilization', label: 'Fertilization', page: 'fertilization', breadcrumbs: ['Outdoor', 'Fertilization'], module: 'outdoor' },
      { id: 'outdoor-sampling', label: 'Sampling', page: 'outdoor-sampling', breadcrumbs: ['Outdoor', 'Sampling'], module: 'outdoor' },
      { id: 'outdoor-settings', label: 'Outdoor Settings', page: 'outdoor-settings', breadcrumbs: ['Outdoor', 'Outdoor Settings'], module: 'outdoor' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    module: 'sales',
    children: [
      { id: 'sales-dashboard', label: 'Sales Dashboard', page: 'sales-dashboard', breadcrumbs: ['Sales', 'Sales Dashboard'], module: 'sales' },
      { id: 'sales-bank', label: 'Bank Account Master', page: 'sales-bank', breadcrumbs: ['Sales', 'Bank Account Master'], module: 'sales' },
      { id: 'sales-customers', label: 'Customers', page: 'sales-customers', breadcrumbs: ['Sales', 'Customers'], module: 'sales' },
      { id: 'instant-sales', label: 'Instant Sales', page: 'instant-sales', breadcrumbs: ['Sales', 'Instant Sales'], module: 'sales' },
      { id: 'pre-bookings', label: 'Pre-Bookings', page: 'pre-bookings', breadcrumbs: ['Sales', 'Pre-Bookings'], module: 'sales' },
      { id: 'sales-refunds', label: 'Refund Disbursements', page: 'sales-refunds', breadcrumbs: ['Sales', 'Refund Disbursements'], module: 'sales' },
      { id: 'sales-inventory-purchases', label: 'Inventory Purchases', page: 'sales-inventory-purchases', breadcrumbs: ['Sales', 'Inventory Purchases'], module: 'sales' },
      { id: 'sales-ledger', label: 'Financial Ledger', page: 'sales-ledger', breadcrumbs: ['Sales', 'Financial Ledger'], module: 'sales' },
      { id: 'sales-settings', label: 'Settings', page: 'sales-settings', breadcrumbs: ['Sales', 'Settings'], module: 'sales' },
    ],
  },
  {
    id: 'inventory-supplier',
    label: 'Inventory & Supplier',
    module: 'inventory',
    children: [
      { id: 'inventory-dashboard', label: 'Inventory Dashboard', page: 'inventory-dashboard', breadcrumbs: ['Inventory & Supplier', 'Inventory Dashboard'], module: 'inventory' },
      { id: 'inventory-record', label: 'Inventory Update', page: 'inventory-record', breadcrumbs: ['Inventory & Supplier', 'Inventory Update'], module: 'inventory' },
      { id: 'purchase-log', label: 'Purchase Log', page: 'purchase-log', breadcrumbs: ['Inventory & Supplier', 'Purchase Log'], module: 'inventory' },
      { id: 'withdrawal-log', label: 'Withdrawal Log', page: 'withdrawal-log', breadcrumbs: ['Inventory & Supplier', 'Withdrawal Log'], module: 'inventory' },
      { id: 'supplier-detail', label: 'Supplier Detail', page: 'supplier-detail', breadcrumbs: ['Inventory & Supplier', 'Supplier Detail'], module: 'inventory' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    module: 'reports',
    page: 'reports',
    breadcrumbs: ['Reports'],
  },
];

const EXTRA_ROUTES: NavItem[] = [
  { id: 'tunnel-master', label: 'Tunnel Master', page: 'tunnel-master', breadcrumbs: ['Outdoor', 'Tunnel Master'], module: 'outdoor' },
  { id: 'batch-timeline', label: 'Batch Timeline', page: 'batch-timeline', breadcrumbs: ['Outdoor', 'Batch Timeline'], module: 'outdoor' },
  { id: 'user-management', label: 'User Management', page: 'user-management', breadcrumbs: ['Admin', 'User Management'], module: 'admin' },
];

const ROUTE_BY_PAGE = new Map<string, NavItem>();

for (const group of NAV_GROUPS) {
  if (group.children) {
    for (const item of group.children) {
      ROUTE_BY_PAGE.set(item.page, item);
    }
  } else if (group.page && group.breadcrumbs) {
    ROUTE_BY_PAGE.set(group.page, {
      id: group.id,
      label: group.label,
      page: group.page,
      breadcrumbs: group.breadcrumbs,
      module: group.module,
    });
  }
}

for (const item of EXTRA_ROUTES) {
  ROUTE_BY_PAGE.set(item.page, item);
}

ROUTE_BY_PAGE.set('indoor-dashboard', ROUTE_BY_PAGE.get('indoor-dashboard')!);

export function getRouteMeta(pathname: string): NavItem {
  const normalized = pathname === '/' ? 'indoor-dashboard' : pathname.replace(/^\//, '');
  return (
    ROUTE_BY_PAGE.get(normalized) ?? {
      id: normalized,
      label: normalized,
      page: normalized,
      breadcrumbs: ['Home'],
      module: 'indoor',
    }
  );
}

export function isIndoorRoute(pathname: string): boolean {
  return getRouteMeta(pathname).module === 'indoor';
}
