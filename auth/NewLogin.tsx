import { useState } from 'react';
import { Button } from '../shared/ui/button';
import { Input } from '../shared/ui/input';
import { Label } from '../shared/ui/label';
import { FlaskConical, LogIn, AlertCircle, UserPlus, Mail, Shield, Key } from 'lucide-react';
import { useAuth } from './AuthContext';
import loginBg from '../login_background/login_bg.JPG';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type Step = 'LOGIN' | 'ADMIN_REGISTER' | 'MASTER_OTP' | 'EMAIL_OTP' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'TWO_FACTOR';

export function Login() {
  const [step, setStep] = useState<Step>('LOGIN');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [masterOTP, setMasterOTP] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [resetOTP, setResetOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [maskedMasterEmail, setMaskedMasterEmail] = useState('');
  const { login } = useAuth();

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setMasterOTP('');
    setEmailOTP('');
    setResetOTP('');
    setNewPassword('');
    setTwoFactorToken('');
    setError('');
    setMaskedMasterEmail('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          twoFactorToken: step === 'TWO_FACTOR' ? twoFactorToken : undefined,
          ipAddress: '0.0.0.0',
          userAgent: navigator.userAgent
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires2FA) {
          setStep('TWO_FACTOR');
        } else if (data.user && data.token) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('auth-token', data.token);
          window.location.reload();
        }
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMasterOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/send-admin-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok) {
        setMaskedMasterEmail(data.masterEmail);
        setStep('MASTER_OTP');
        if (data.otp) {
        }
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setStep('EMAIL_OTP');
        if (data.otp) {
        }
      } else {
        setError(data.message || 'Failed to send verification OTP');
      }
    } catch (err) {
      setError('Failed to send verification OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username,
          firstName,
          lastName,
          masterOTP,
          emailOTP
        })
      });

      const data = await res.json();

      if (res.ok) {
        resetForm();
        setStep('LOGIN');
        // TODO: Replace with toast({ title: 'Admin account created successfully! Please login.' });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordResetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/send-password-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setStep('RESET_PASSWORD');
        if (data.otp) {
        }
      } else {
        setError(data.message || 'Failed to send reset OTP');
      }
    } catch (err) {
      setError('Failed to send reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          newPassword,
          otp: resetOTP
        })
      });

      const data = await res.json();

      if (res.ok) {
        resetForm();
        setStep('LOGIN');
        // TODO: Replace with toast({ title: 'Password reset successfully! Please login with your new password.' });
      } else {
        setError(data.message || 'Password reset failed');
      }
    } catch (err) {
      setError('Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'LOGIN':
        return (
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 text-base"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 h-11 text-base font-medium" style={{ marginTop: '24px' }}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => { resetForm(); setStep('FORGOT_PASSWORD'); }}
                className="text-base text-green-600 hover:text-green-700 underline block w-full mb-6"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => { resetForm(); setStep('ADMIN_REGISTER'); }}
                className="text-base text-green-600 hover:text-green-700 underline block w-full"
              >
                Create Admin Account
              </button>
            </div>
          </form>
        );

      case 'ADMIN_REGISTER':
        return (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-base font-medium">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-base font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-10 text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-username" className="text-base font-medium">Username</Label>
              <Input
                id="reg-username"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-10 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@seemabiotech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 text-base"
              />
            </div>

            <Button
              onClick={handleSendMasterOTP}
              disabled={loading || !username || !email || !password || !firstName || !lastName}
              className="w-full bg-green-600 hover:bg-green-700 h-10 text-base font-medium mt-4"
            >
              <Shield className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Send Master OTP'}
            </Button>

            <button
              onClick={() => { resetForm(); setStep('LOGIN'); }}
              className="text-base text-green-600 hover:text-green-700 underline w-full text-center mt-3"
            >
              Back to Login
            </button>
          </div>
        );

      case 'MASTER_OTP':
        return (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-base">
              <p>Master OTP sent to: <strong>{maskedMasterEmail}</strong></p>
              <p className="text-base mt-1">Check your email and enter the 6-digit code below.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="masterOTP" className="text-base font-medium">Master OTP</Label>
              <Input
                id="masterOTP"
                placeholder="123456"
                value={masterOTP}
                onChange={(e) => setMasterOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="h-10 text-base text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleSendEmailOTP}
              disabled={loading || masterOTP.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 h-10 text-base font-medium mt-4"
            >
              <Mail className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Send Email OTP'}
            </Button>

            <button
              onClick={() => { setStep('ADMIN_REGISTER'); setError(''); }}
              className="text-base text-green-600 hover:text-green-700 underline w-full text-center mt-3"
            >
              Back
            </button>
          </div>
        );

      case 'EMAIL_OTP':
        return (
          <form onSubmit={handleRegisterAdmin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-base">
              <p>Verification OTP sent to: <strong>{email}</strong></p>
              <p className="text-base mt-1">Check your email and enter the 6-digit code below.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailOTP" className="text-base font-medium">Email Verification OTP</Label>
              <Input
                id="emailOTP"
                placeholder="123456"
                value={emailOTP}
                onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="h-10 text-base text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || emailOTP.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 h-10 text-base font-medium mt-4"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </Button>

            <button
              type="button"
              onClick={() => { setStep('MASTER_OTP'); setError(''); }}
              className="text-base text-green-600 hover:text-green-700 underline w-full text-center mt-3"
            >
              Back
            </button>
          </form>
        );

      case 'FORGOT_PASSWORD':
        return (
          <form onSubmit={handleSendPasswordResetOTP} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-base"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 h-10 text-base font-medium mt-4">
              <Mail className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </Button>

            <button
              type="button"
              onClick={() => { resetForm(); setStep('LOGIN'); }}
              className="text-base text-green-600 hover:text-green-700 underline w-full text-center mt-3"
            >
              Back to Login
            </button>
          </form>
        );

      case 'RESET_PASSWORD':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-base">
              <p>Reset OTP sent to: <strong>{email}</strong></p>
              <p className="text-base mt-1">Check your email and enter the code below.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resetOTP" className="text-base font-medium">Reset OTP</Label>
              <Input
                id="resetOTP"
                placeholder="123456"
                value={resetOTP}
                onChange={(e) => setResetOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="h-10 text-base text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-base font-medium">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-10 text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || resetOTP.length !== 6 || !newPassword}
              className="w-full bg-green-600 hover:bg-green-700 h-10 text-base font-medium mt-4"
            >
              <Key className="w-4 h-4 mr-2" />
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>

            <button
              type="button"
              onClick={() => { setStep('FORGOT_PASSWORD'); setError(''); }}
              className="text-base text-green-600 hover:text-green-700 underline w-full text-center mt-3"
            >
              Back
            </button>
          </form>
        );

      case 'TWO_FACTOR':
        return (
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-base">
              <p className="font-medium">Two-Factor Authentication Required</p>
              <p className="text-sm mt-1">Enter the 6-digit code from your authenticator app</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twoFactorToken" className="text-base font-medium">Verification Code</Label>
              <Input
                id="twoFactorToken"
                placeholder="000000"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoFocus
                required
                className="h-11 text-base text-center text-lg tracking-widest"
              />
            </div>

            <Button type="submit" disabled={loading || twoFactorToken.length !== 6} className="w-full bg-green-600 hover:bg-green-700 h-11 text-base font-medium" style={{ marginTop: '24px' }}>
              <Shield className="w-4 h-4 mr-2" />
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </Button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => { setStep('LOGIN'); setTwoFactorToken(''); setError(''); }}
                className="text-base text-green-600 hover:text-green-700 underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'LOGIN': return 'Sign In';
      case 'ADMIN_REGISTER': return 'Create Admin Account';
      case 'MASTER_OTP': return 'Master Authorization';
      case 'EMAIL_OTP': return 'Email Verification';
      case 'FORGOT_PASSWORD': return 'Forgot Password';
      case 'RESET_PASSWORD': return 'Reset Password';
      case 'TWO_FACTOR': return 'Two-Factor Authentication';
      default: return 'Sign In';
    }
  };

  const getDescription = () => {
    switch (step) {
      case 'LOGIN': return 'Enter your credentials to access your account';
      case 'ADMIN_REGISTER': return 'Setup the first administrator account';
      case 'MASTER_OTP': return 'Enter the OTP sent to the master email';
      case 'EMAIL_OTP': return 'Verify your email address';
      case 'FORGOT_PASSWORD': return 'Enter your email to reset password';
      case 'RESET_PASSWORD': return 'Enter OTP and new password';
      case 'TWO_FACTOR': return 'Enter your 6-digit verification code';
      default: return 'Enter your credentials to access your account';
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div className="w-full" style={{ maxWidth: '420px' }}>
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.6)',
            padding: '44px 40px 32px',
          }}
        >
          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-gray-900">
              {getTitle()}
            </h2>
          </div>
          <div>
            {renderStep()}
          </div>

          <p className="text-center text-base text-gray-400 mt-6 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
            © 2024 Seema Biotech. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}