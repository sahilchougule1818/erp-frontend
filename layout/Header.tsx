import { 
  Bell, LogOut, FlaskConical, Sprout, ShoppingCart, Package, FileText,
  Home, TestTube, Microscope, Thermometer, ShieldCheck, Warehouse, TreePine,
  ArrowRightLeft, Bug, Droplets, Clock, LayoutDashboard, Building, Shield, Menu, Users
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../shared/ui/avatar';
import { Badge } from '../shared/ui/badge';
import { Button } from '../shared/ui/button';
import { LabSelector } from '../shared/components/LabSelector';
import { useLabContext } from '../indoor/contexts/LabContext';
import { useAuth, User } from '../auth/AuthContext';
import { useState, useEffect } from 'react';
import { TwoFactorSetup } from '../auth/TwoFactorSetup';
import { useToast } from '../shared/ui/use-toast';
import { NotificationPanel } from '../sales/components/NotificationPanel';
import apiClient from '../shared/services/apiClient';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../shared/ui/dropdown-menu';

interface HeaderProps {
  breadcrumbs: string[];
  user: User | null;
  onNavigate?: (page: string, breadcrumbs: string[]) => void;
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'indoor-operator':
      return 'Indoor Operator';
    case 'outdoor-operator':
      return 'Outdoor Operator';
    case 'sales-analyst':
      return 'Sales & Report Analyst';
    default:
      return 'User';
  }
};

export function Header({ breadcrumbs, user, onNavigate }: HeaderProps) {
  const { logout } = useAuth();
  const { labNumber, setLabNumber, isLocked } = useLabContext();
  const { toast } = useToast();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [has2FA, setHas2FA] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) check2FAStatus();
    fetchNotificationCount();
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      const data = await apiClient.get<any[]>('/sales/notifications/upcoming-deliveries');
      setNotificationCount(data.length);
    } catch {
      // non-critical
    }
  };

  const check2FAStatus = async () => {
    try {
      const data = await apiClient.get<{ enabled: boolean }>('/auth/2fa/status');
      setHas2FA(data.enabled);
    } catch {
      // non-critical
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return;
    try {
      await apiClient.post('/auth/2fa/disable', {});
      setHas2FA(false);
      toast({ title: '2FA disabled successfully' });
    } catch {
      toast({ title: 'Failed to disable 2FA', variant: 'destructive' });
    }
  };


  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getModuleIcon = (pageName: string) => {
    const iconMap: { [key: string]: any } = {
      'Indoor Dashboard': Home,
      'Media Preparation': TestTube,
      'Subculturing': Microscope,
      'Incubation': Thermometer,
      'Cleaning Record': ShieldCheck,
      'Sampling': TestTube,
      'Outdoor Dashboard': Warehouse,
      'Dashboard': Warehouse,
      'Primary Hardening': TreePine,
      'Secondary Hardening': Sprout,
      'Shifting': ArrowRightLeft,
      'Contamination': Bug,
      'Fertilization': Droplets,
      'Holding Area': Package,
      'Batch Timeline': Clock,
      'Inventory': LayoutDashboard,
      'Buyer': ShoppingCart,
      'Seller': FileText,
      'Ledger': FileText,
      'Inventory Record': Package,
      'Supplier Detail': Building,
      'Reports': FileText
    };
    return iconMap[pageName] || FileText;
  };

  const getModuleColor = (module: string) => {
    return { bg: 'bg-green-50', border: 'border-green-100', icon: 'text-green-600', text: 'text-green-700' };
  };

  const currentModule = breadcrumbs[0] || '';
  const currentPage = breadcrumbs[breadcrumbs.length - 1] || '';
  const ModuleIcon = getModuleIcon(currentPage);
  const colors = getModuleColor(currentModule);

  return (
    <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50 border-b border-gray-200">
      <div className="h-16 px-6 flex items-center justify-end">
        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Lab Selector - Only show for Indoor module */}
          {breadcrumbs[0] === 'Indoor' && (
            <div className="pr-4 border-r border-gray-200">
              {isLocked
                ? <span className="text-sm font-medium text-slate-600">Lab {labNumber}</span>
                : <LabSelector value={labNumber} onChange={setLabNumber} />
              }
            </div>
          )}
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-white/60 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-base font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel onClose={() => { setShowNotifications(false); fetchNotificationCount(); }} />
            )}
          </div>

          {/* User Profile */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-4 border-l border-green-200 hover:bg-white/60 px-2 py-1 rounded-lg transition-colors">
                  <div className="text-right">
                    <div className="text-base font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                    <div className="text-base text-green-600">{user.role || 'User'}</div>
                  </div>
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-medium leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-base leading-none text-muted-foreground">{user.email}</p>
                    <p className="text-base leading-none text-muted-foreground mt-1">
                      {user.role || 'User'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'Admin' && (
                  <DropdownMenuItem onClick={() => onNavigate?.('user-management', ['Admin', 'User Management'])} className="cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </DropdownMenuItem>
                )}
                {has2FA ? (
                  <DropdownMenuItem onClick={handleDisable2FA} className="cursor-pointer">
                    <Shield className="w-4 h-4 mr-2" />
                    Disable 2FA
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setShow2FASetup(true)} className="cursor-pointer">
                    <Shield className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {show2FASetup && <TwoFactorSetup onClose={() => { setShow2FASetup(false); check2FAStatus(); }} />}
    </div>
  );
}
