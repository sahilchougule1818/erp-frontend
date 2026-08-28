import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { Input } from '../shared/ui/input';
import { Label } from '../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../shared/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../shared/ui/table';
import { Badge } from '../shared/ui/badge';
import { UserPlus, Trash2, AlertCircle, Mail, Shield, Settings } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNotify } from '../shared/hooks/useNotify';
import { fetchCsrfToken } from '../shared/helpers/csrf';
import apiClient from '../shared/services/apiClient';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Manager {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_name: string;
  lab_number: number | null;
  is_active: boolean;
  created_at: string;
}

export function UserManagement() {
  const notify = useNotify();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Create manager form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [labNumber, setLabNumber] = useState('');
  const [labs, setLabs] = useState<{ lab_number: number; lab_name: string }[]>([]);
  const [emailOTP, setEmailOTP] = useState('');
  const [showEmailOTP, setShowEmailOTP] = useState(false);
  
  // Delete manager
  const [masterOTP, setMasterOTP] = useState('');
  const [showMasterOTP, setShowMasterOTP] = useState(false);
  
  // Master email change
  const [currentMasterEmail, setCurrentMasterEmail] = useState('');
  const [showMasterEmailDialog, setShowMasterEmailDialog] = useState(false);
  const [newMasterEmail, setNewMasterEmail] = useState('');
  const [oldEmailOTP, setOldEmailOTP] = useState('');
  const [newEmailOTP, setNewEmailOTP] = useState('');
  const [showMasterEmailOTPs, setShowMasterEmailOTPs] = useState(false);
  const [masterEmailError, setMasterEmailError] = useState('');
  
  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (hasRole('Admin')) {
      fetchCsrfToken();
      fetchManagers();
      fetchMasterEmail();
      fetchLabs();
    }
  }, [hasRole]);

  const fetchLabs = async () => {
    try {
      const data = await apiClient.get<{ lab_number: number; lab_name: string; is_active: boolean }[]>('/indoor/labs');
      setLabs(data.filter(l => l.is_active));
    } catch {}
  };

  const fetchManagers = async () => {
    try {
      const data = await apiClient.get<Manager[]>('/auth/managers');
      setManagers(data);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const fetchMasterEmail = async () => {
    try {
      const data = await apiClient.get<{ masterEmail: string }>('/auth/master-email');
      setCurrentMasterEmail(data.masterEmail);
    } catch (error) {
      console.error('Error fetching master email:', error);
    }
  };

  const resetCreateForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setUsername('');
    setRole('');
    setLabNumber('');
    setEmailOTP('');
    setShowEmailOTP(false);
    setError('');
  };

  const resetDeleteForm = () => {
    setMasterOTP('');
    setShowMasterOTP(false);
    setSelectedManager(null);
    setError('');
  };

  const resetMasterEmailForm = () => {
    setNewMasterEmail('');
    setOldEmailOTP('');
    setNewEmailOTP('');
    setShowMasterEmailOTPs(false);
    setMasterEmailError('');
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (pwd.length > 128) return 'Password must not exceed 128 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return 'Password must contain at least one special character';
    return null;
  };

  const handleSendEmailOTP = async () => {
    setError('');

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setLoading(true);
    
    try {
      // Check username availability first
      const checkRes = await apiClient.post<{ available: boolean }>('/auth/check-username', { username });
      if (!checkRes.available) {
        setError('Username already taken');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowEmailOTP(true);
      } else {
        setError(data.message || 'Failed to send verification OTP');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send verification OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/create-manager', { email, password, firstName, lastName, username, role, labNumber: labNumber ? parseInt(labNumber) : undefined, emailOTP });
      resetCreateForm();
      setShowCreateModal(false);
      fetchManagers();
      notify.success('Manager account created successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to create manager');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDeleteOTP = async () => {
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/send-manager-delete-otp', {});
      setShowMasterOTP(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send master OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManager = async () => {
    setError('');
    setLoading(true);
    try {
      await apiClient.delete('/auth/delete-manager', { data: { userId: selectedManager?.user_id, masterOTP } });
      resetDeleteForm();
      setShowDeleteDialog(false);
      fetchManagers();
      notify.success('Manager account deleted successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to delete manager');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMasterEmailOTPs = async () => {
    setMasterEmailError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/send-master-email-change-otps', { newEmail: newMasterEmail });
      setShowMasterEmailOTPs(true);
    } catch (error: any) {
      setMasterEmailError(error.message || 'Failed to send OTPs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMasterEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMasterEmailError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/update-master-email', { newEmail: newMasterEmail, oldOTP: oldEmailOTP, newOTP: newEmailOTP });
      resetMasterEmailForm();
      setShowMasterEmailDialog(false);
      fetchMasterEmail();
      notify.success('Master email updated successfully!');
    } catch (error: any) {
      setMasterEmailError(error.message || 'Failed to update master email');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'IndoorManager': return 'bg-green-100 text-green-800';
      case 'OutdoorManager': return 'bg-blue-100 text-blue-800';
      case 'SalesManager': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasRole('Admin')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p>Only Admin users can access user management.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Button onClick={() => setShowCreateModal(true)} className="bg-green-600 hover:bg-green-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Manager
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Lab</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.user_id}>
                  <TableCell className="font-medium">
                    {manager.first_name} {manager.last_name}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{manager.username}</TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(manager.role_name)}>
                      {manager.role_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {manager.lab_number ? `Lab ${manager.lab_number}` : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={manager.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {manager.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(manager.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedManager(manager);
                        setShowDeleteDialog(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {managers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No managers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Master Email Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Master Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Master Email</p>
              <p className="font-medium">{currentMasterEmail || 'Loading...'}</p>
              <p className="text-xs text-gray-500 mt-1">Used for admin creation and critical operations</p>
            </div>
            <Button 
              onClick={() => setShowMasterEmailDialog(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Change Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Manager Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Manager</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateManager} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => { setRole(v); setLabNumber(''); }} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IndoorManager">Indoor Manager</SelectItem>
                  <SelectItem value="OutdoorManager">Outdoor Manager</SelectItem>
                  <SelectItem value="SalesManager">Sales Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === 'IndoorManager' && (
              <div className="space-y-2">
                <Label htmlFor="labNumber">Assigned Lab *</Label>
                <Select value={labNumber} onValueChange={setLabNumber} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lab" />
                  </SelectTrigger>
                  <SelectContent>
                    {labs.map(lab => (
                      <SelectItem key={lab.lab_number} value={lab.lab_number.toString()}>
                        Lab {lab.lab_number} — {lab.lab_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {!showEmailOTP ? (
              <Button 
                type="button"
                onClick={handleSendEmailOTP}
                disabled={loading || !username || !email || !password || !firstName || !lastName || !role || (role === 'IndoorManager' && !labNumber)}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send Email Verification'}
              </Button>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-base">
                  <p>Verification OTP sent to: <strong>{email}</strong></p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailOTP">Email Verification OTP</Label>
                  <Input
                    id="emailOTP"
                    placeholder="123456"
                    value={emailOTP}
                    onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetCreateForm();
                      setShowCreateModal(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading || emailOTP.length !== 6}
                    className="flex-1"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Manager'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Manager Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manager Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for <strong>{selectedManager?.first_name} {selectedManager?.last_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {!showMasterOTP ? (
            <AlertDialogFooter>
              <AlertDialogCancel onClick={resetDeleteForm}>Cancel</AlertDialogCancel>
              <Button 
                onClick={handleSendDeleteOTP}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send Authorization OTP'}
              </Button>
            </AlertDialogFooter>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-base">
                <p>Authorization OTP sent to master email</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="masterOTP">Master Authorization OTP</Label>
                <Input
                  id="masterOTP"
                  placeholder="123456"
                  value={masterOTP}
                  onChange={(e) => setMasterOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel onClick={resetDeleteForm}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteManager}
                  disabled={loading || masterOTP.length !== 6}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {loading ? 'Deleting...' : 'Delete Manager'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Master Email Dialog */}
      <Dialog open={showMasterEmailDialog} onOpenChange={setShowMasterEmailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Master Email</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateMasterEmail} className="space-y-4">
            {masterEmailError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{masterEmailError}</span>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm">
              <p className="font-medium mb-1">Current Master Email:</p>
              <p>{currentMasterEmail}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newMasterEmail">New Master Email</Label>
              <Input
                id="newMasterEmail"
                type="email"
                value={newMasterEmail}
                onChange={(e) => setNewMasterEmail(e.target.value)}
                required
                disabled={showMasterEmailOTPs}
              />
            </div>
            
            {!showMasterEmailOTPs ? (
              <Button 
                type="button"
                onClick={handleSendMasterEmailOTPs}
                disabled={loading || !newMasterEmail}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send Verification OTPs'}
              </Button>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
                  <p>OTPs sent to both current and new email addresses</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oldEmailOTP">OTP from Current Email</Label>
                  <Input
                    id="oldEmailOTP"
                    placeholder="123456"
                    value={oldEmailOTP}
                    onChange={(e) => setOldEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newEmailOTP">OTP from New Email</Label>
                  <Input
                    id="newEmailOTP"
                    placeholder="123456"
                    value={newEmailOTP}
                    onChange={(e) => setNewEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetMasterEmailForm();
                      setShowMasterEmailDialog(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading || oldEmailOTP.length !== 6 || newEmailOTP.length !== 6}
                    className="flex-1"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Email'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}