import { useState, useEffect } from 'react';
import { LogOut, Shield, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../shared/ui/avatar';
import { useAuth, User } from '../auth/AuthContext';
import { useToast } from '../shared/ui/use-toast';
import { TwoFactorSetup } from '../auth/TwoFactorSetup';
import apiClient from '../shared/api/apiClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../shared/ui/dropdown-menu';

interface SidebarFooterProps {
  user: User | null;
  isCollapsed: boolean;
  onNavigate?: (page: string) => void;
}

export function SidebarFooter({ user, isCollapsed, onNavigate }: SidebarFooterProps) {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [has2FA, setHas2FA] = useState(false);

  useEffect(() => {
    if (user) check2FAStatus();
  }, [user]);

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

  if (!user) return null;

  return (
    <div className="border-t erp-sidebar-divider px-2 py-3">
      <div className="erp-sidebar-footer-box rounded-xl border px-2 py-2">
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center gap-2 w-full min-w-0 erp-sidebar-hover rounded-lg transition-colors p-2 ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-white/25 text-white text-sm font-semibold">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <div className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-white/80 truncate">{user.role || 'User'}</div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">{user.role || 'User'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.role === 'Admin' && (
              <DropdownMenuItem onClick={() => onNavigate?.('user-management')} className="cursor-pointer">
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
      </div>

      {show2FASetup && <TwoFactorSetup onClose={() => { setShow2FASetup(false); check2FAStatus(); }} />}
    </div>
  );
}
