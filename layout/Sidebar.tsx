import { useState, useMemo, useEffect } from 'react';
import {
  Home,
  FlaskConical,
  Sprout,
  ShoppingCart,
  FileText,
  ChevronDown,
  ChevronRight,
  TestTube,
  Microscope,
  Thermometer,
  ShieldCheck,
  Warehouse,
  TreePine,
  ArrowRightLeft,
  Bug,
  Droplets,
  Package,
  LayoutDashboard,
  Building,
  Users,
  Command,
  ShoppingBag,
  LayoutList,
  Banknote,
  PackagePlus,
  RotateCcw,
  GitBranch,
  Settings
} from 'lucide-react';
import { User } from '../auth/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, breadcrumbs: string[]) => void;
  user: User | null;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentPage, onNavigate, user, isCollapsed, onToggle }: SidebarProps) {
  // Determine which groups should be expanded based on user role
  const getInitialExpandedGroups = () => {
    if (!user) return [];
    
    const userRole = user.role || '';
    
    switch (userRole) {
      case 'Admin':
        return ['indoor', 'outdoor', 'inventory-supplier', 'sales', 'reports'];
      case 'IndoorManager':
        return ['indoor'];
      case 'OutdoorManager':
        return ['outdoor'];
      case 'SalesManager':
        return ['sales', 'inventory-supplier', 'reports'];
      default:
        return [];
    }
  };

  const [expandedGroups, setExpandedGroups] = useState<string[]>(getInitialExpandedGroups());

  // Update expanded groups when user changes
  useEffect(() => {
    setExpandedGroups(getInitialExpandedGroups());
  }, [user]);

  const toggleGroup = (group: string) => {
    // If sidebar is collapsed, expand it first
    if (isCollapsed) {
      onToggle();
    }
    setExpandedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  // Close all expanded groups when sidebar collapses
  useEffect(() => {
    if (isCollapsed) {
      setExpandedGroups([]);
    }
  }, [isCollapsed]);

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    const allMenuItems = [
    {
      id: 'indoor',
      label: 'Indoor Module',
      icon: FlaskConical,
      children: [
        { id: 'indoor-dashboard', label: 'Indoor Dashboard', icon: Home, page: 'indoor-dashboard', breadcrumbs: ['Indoor', 'Indoor Dashboard'] },
        { id: 'operator-master', label: 'Operator Master', icon: Users, page: 'operator-master', breadcrumbs: ['Indoor', 'Operator Master'] },
        { id: 'media-preparation', label: 'Media Preparation', icon: TestTube, page: 'media-preparation', breadcrumbs: ['Indoor', 'Media Preparation'] },
        { id: 'indoor-batch-master', label: 'Batch Master', icon: Command, page: 'indoor-batch-master', breadcrumbs: ['Indoor', 'Batch Master'] },
        { id: 'subculturing', label: 'Subculturing', icon: Microscope, page: 'subculturing', breadcrumbs: ['Indoor', 'Subculturing'] },
        { id: 'incubation', label: 'Incubation', icon: Thermometer, page: 'incubation', breadcrumbs: ['Indoor', 'Incubation'] },
        { id: 'rooting', label: 'Rooting', icon: GitBranch, page: 'rooting', breadcrumbs: ['Indoor', 'Rooting'] },
        { id: 'indoor-contamination', label: 'Indoor Contamination', icon: Bug, page: 'indoor-contamination', breadcrumbs: ['Indoor', 'Indoor Contamination'] },
        { id: 'cleaning-record', label: 'Cleaning Record', icon: ShieldCheck, page: 'cleaning-record', breadcrumbs: ['Indoor', 'Cleaning Record'] },
        { id: 'sampling', label: 'Sampling', icon: TestTube, page: 'sampling', breadcrumbs: ['Indoor', 'Sampling'] },
        { id: 'indoor-settings', label: 'Indoor Settings', icon: Settings, page: 'indoor-settings', breadcrumbs: ['Indoor', 'Indoor Settings'] }
      ]
    },
    {
      id: 'outdoor',
      label: 'Outdoor Module',
      icon: Sprout,
      children: [
        { id: 'outdoor-dashboard', label: 'Outdoor Dashboard', icon: Warehouse, page: 'outdoor-dashboard', breadcrumbs: ['Outdoor', 'Dashboard'] },
        { id: 'outdoor-operator-master', label: 'Worker Master', icon: Users, page: 'outdoor-operator-master', breadcrumbs: ['Outdoor', 'Worker Master'] },
        { id: 'batch-master', label: 'Batch Master', icon: Command, page: 'batch-master', breadcrumbs: ['Outdoor', 'Batch Master'] },
        { id: 'primary-hardening', label: 'Primary Hardening', icon: Sprout, page: 'primary-hardening', breadcrumbs: ['Outdoor', 'Primary Hardening'] },
        { id: 'secondary-hardening', label: 'Secondary Hardening', icon: TreePine, page: 'secondary-hardening', breadcrumbs: ['Outdoor', 'Secondary Hardening'] },
        { id: 'shifting', label: 'Shifting Records', icon: ArrowRightLeft, page: 'shifting', breadcrumbs: ['Outdoor', 'Shifting Records'] },
        { id: 'holding-area', label: 'Holding Area', icon: Package, page: 'holding-area', breadcrumbs: ['Outdoor', 'Holding Area'] },
        { id: 'outdoor-mortality', label: 'Outdoor Mortality', icon: Bug, page: 'outdoor-mortality', breadcrumbs: ['Outdoor', 'Outdoor Mortality'] },
        { id: 'fertilization', label: 'Fertilization', icon: Droplets, page: 'fertilization', breadcrumbs: ['Outdoor', 'Fertilization'] },
        { id: 'outdoor-sampling', label: 'Sampling', icon: TestTube, page: 'outdoor-sampling', breadcrumbs: ['Outdoor', 'Sampling'] },
        { id: 'outdoor-settings', label: 'Outdoor Settings', icon: Settings, page: 'outdoor-settings', breadcrumbs: ['Outdoor', 'Outdoor Settings'] }
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingCart,
      children: [
        { id: 'sales-dashboard', label: 'Sales Dashboard', icon: LayoutDashboard, page: 'sales-dashboard', breadcrumbs: ['Sales', 'Sales Dashboard'] },
        { id: 'sales-bank', label: 'Bank Account Master', icon: Building, page: 'sales-bank', breadcrumbs: ['Sales', 'Bank Account Master'] },
        { id: 'sales-customers', label: 'Customers', icon: Users, page: 'sales-customers', breadcrumbs: ['Sales', 'Customers'] },
        { id: 'instant-sales', label: 'Instant Sales', icon: ShoppingCart, page: 'instant-sales', breadcrumbs: ['Sales', 'Instant Sales'] },
        { id: 'pre-bookings', label: 'Pre-Bookings', icon: ShoppingBag, page: 'pre-bookings', breadcrumbs: ['Sales', 'Pre-Bookings'] },
        { id: 'sales-refunds', label: 'Refund Disbursements', icon: RotateCcw, page: 'sales-refunds', breadcrumbs: ['Sales', 'Refund Disbursements'] },
        { id: 'sales-inventory-purchases', label: 'Inventory Purchases', icon: PackagePlus, page: 'sales-inventory-purchases', breadcrumbs: ['Sales', 'Inventory Purchases'] },
        { id: 'sales-ledger', label: 'Financial Ledger', icon: FileText, page: 'sales-ledger', breadcrumbs: ['Sales', 'Financial Ledger'] },
        { id: 'sales-settings', label: 'Settings', icon: Settings, page: 'sales-settings', breadcrumbs: ['Sales', 'Settings'] }
      ]
    },
    {
      id: 'inventory-supplier',
      label: 'Inventory & Supplier',
      icon: Package,
      children: [
        { id: 'inventory-dashboard', label: 'Inventory Dashboard', icon: LayoutDashboard, page: 'inventory-dashboard', breadcrumbs: ['Inventory & Supplier', 'Inventory Dashboard'] },
        { id: 'inventory-record', label: 'Inventory Update', icon: Package, page: 'inventory-record', breadcrumbs: ['Inventory & Supplier', 'Inventory Update'] },
        { id: 'purchase-log', label: 'Purchase Log', icon: ShoppingBag, page: 'purchase-log', breadcrumbs: ['Inventory & Supplier', 'Purchase Log'] },
        { id: 'withdrawal-log', label: 'Withdrawal Log', icon: LayoutList, page: 'withdrawal-log', breadcrumbs: ['Inventory & Supplier', 'Withdrawal Log'] },
        { id: 'supplier-detail', label: 'Supplier Detail', icon: Building, page: 'supplier-detail', breadcrumbs: ['Inventory & Supplier', 'Supplier Detail'] }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      page: 'reports',
      breadcrumbs: ['Reports']
    }
    ];

    if (!user) return [];

    // Admin has access to everything
    if (user.role === 'Admin') return allMenuItems;

    // Filter based on specific roles
    const userRole = user.role;
    
    if (userRole === 'IndoorManager') {
      return allMenuItems.filter(item => item.id === 'indoor');
    }
    
    if (userRole === 'OutdoorManager') {
      return allMenuItems.filter(item => item.id === 'outdoor');
    }
    
    if (userRole === 'SalesManager') {
      return allMenuItems.filter(item => ['sales', 'inventory-supplier', 'reports'].includes(item.id));
    }

    return [];
  }, [user]);

  return (
    <div className="bg-green-50 border-r border-gray-200 flex flex-col flex-shrink-0" style={{ width: isCollapsed ? '64px' : '288px' }}>
      {/* Toggle Button - Fixed */}
      <div className="h-16 flex items-center px-3 bg-green-50">
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center hover:bg-green-100 rounded-full transition-colors flex-shrink-0"
          style={{ backgroundColor: '#166534', borderRadius: '10px' }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Menu - Collapsible */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 transition-all duration-300 space-y-3">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {item.children ? (
              <>
                <button
                  onClick={() => toggleGroup(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-gray-700 hover:bg-green-50 transition-colors ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className="flex items-center">
                    <item.icon className={`w-5 h-5 text-green-600 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && <span className="text-base font-medium">{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    expandedGroups.includes(item.id) ? (
                      <ChevronDown className="w-4 h-4 text-green-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-green-600" />
                    )
                  )}
                </button>
                {!isCollapsed && expandedGroups.includes(item.id) && (
                  <div className="bg-green-50/30 border-t border-gray-200">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => {
                          if (isCollapsed) onToggle();
                          onNavigate(child.page, child.breadcrumbs);
                        }}
                        className={`w-full flex items-center px-3 pl-12 py-2.5 text-base transition-colors ${
                          currentPage === child.page
                            ? 'bg-green-50 text-green-700 border-r-4 border-green-600 font-medium'
                            : 'text-gray-600 hover:bg-green-50 border-l-4 border-transparent'
                        }`}
                      >
                        <child.icon className="w-4 h-4 mr-3" />
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  if (isCollapsed) onToggle();
                  onNavigate(item.page!, item.breadcrumbs!);
                }}
                className={`w-full flex items-center px-3 py-2.5 text-base transition-colors ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  currentPage === item.page
                    ? 'bg-green-50 text-green-700 border-r-4 border-green-600 font-medium'
                    : 'text-gray-700 hover:bg-green-50 border-l-4 border-transparent'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className={`w-5 h-5 text-green-600 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && item.label}
              </button>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
