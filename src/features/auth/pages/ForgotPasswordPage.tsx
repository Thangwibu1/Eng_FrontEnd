import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const forgotMutation = useForgotPassword();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      await forgotMutation.mutateAsync({
        identifier,
        newPassword,
        confirmPassword,
      });
      setSuccessMsg('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to reset password. User not found.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-[#FE9EC7]/10 via-[#89D4FF]/10 to-[#44ACFF]/10 rounded-3xl shadow-inner animate-fade-in">
      <div className="max-w-md w-full space-y-6 bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-soft">
        
        {/* Branding header match image 9 */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-brand-pink/20 flex items-center justify-center p-1 border border-brand-pink/15 shadow-sm">
            <img src="/bunny_reading.png" className="w-full h-full object-contain rounded-full" alt="Mascot Logo" />
          </div>
          <span className="font-extrabold text-lg text-text-primary tracking-tight">
            Aura<span className="text-brand-pink">English</span>
          </span>
          <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase -mt-2">SRS & Readings</p>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            Forgot Password
          </h2>
          <p className="text-xs text-text-secondary font-medium">
            Reset your password for MVP access
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl p-4 flex items-start gap-2.5 text-sm font-semibold animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-150 text-emerald-700 p-4 rounded-2xl flex items-start gap-2.5 text-sm font-semibold animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-pink">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email or username"
                  className="pl-12 w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition duration-200"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-pink">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="pl-12 w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition duration-200"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-pink">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-12 w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition duration-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={forgotMutation.isPending}
              className="w-full h-12 bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 text-white rounded-full font-bold shadow-pastel hover:scale-[1.02] active:scale-[0.98] transition-all-180 flex items-center justify-center text-sm uppercase tracking-wider"
            >
              {forgotMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 flex justify-center">
          <Link to="/login" className="font-bold text-sm text-brand-pink hover:text-brand-pink/80 transition duration-200 flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
