import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/services/api/authApi';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export function ResetPasswordPage() {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      toast.success('If the email exists, a reset code has been sent.');
      setStep('confirm');
    } catch {
      toast.error('Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) { toast.error('Reset code is required'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }

    setIsLoading(true);
    try {
      await authApi.resetPassword(email, token, newPassword);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 mb-4 shadow-lg shadow-amber-500/30">
            <KeyRound size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-100">
            {step === 'request' ? 'Reset Password' : 'Set New Password'}
          </h1>
          <p className="text-surface-400 text-sm mt-1">
            {step === 'request'
              ? 'Enter your email to receive a reset code'
              : 'Enter the code and your new password'}
          </p>
        </div>

        <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {step === 'request' ? (
            <form onSubmit={handleRequest} className="space-y-5">
              <Input label="Email Address" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} id="reset-email" />
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Send Reset Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <Input label="Reset Code" placeholder="Enter the code from your email"
                value={token} onChange={(e) => setToken(e.target.value)} id="reset-token" />
              <Input label="New Password" type="password" placeholder="Min 8 characters"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} id="reset-new-password" />
              <Input label="Confirm Password" type="password" placeholder="Re-enter password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="reset-confirm" />
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Reset Password
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
