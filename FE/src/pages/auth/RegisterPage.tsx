import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/services/api/authApi';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', age: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 1) errs.age = 'Valid age is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authApi.register({
        name: form.name,
        age: Number(form.age),
        email: form.email,
        password: form.password,
      });
      toast.success('Account created! Please verify your email.');
      navigate('/verify-email', { state: { email: form.email } });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 mb-4 shadow-lg shadow-primary-500/30">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-100">Create Account</h1>
          <p className="text-surface-400 text-sm mt-1">
            Join UniAnalytics Dashboard
          </p>
        </div>

        <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" value={form.name}
              onChange={(e) => update('name', e.target.value)} error={errors.name} id="register-name" />

            <Input label="Age" type="number" placeholder="22" value={form.age}
              onChange={(e) => update('age', e.target.value)} error={errors.age} id="register-age" />

            <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => update('email', e.target.value)} error={errors.email} id="register-email" />

            <div className="relative">
              <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters"
                value={form.password} onChange={(e) => update('password', e.target.value)} error={errors.password}
                id="register-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-surface-500 hover:text-surface-300 transition-colors cursor-pointer">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Input label="Confirm Password" type="password" placeholder="Re-enter password"
              value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
              error={errors.confirmPassword} id="register-confirm" />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
