import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!identifier || !password) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ identifier, password });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-[#FE9EC7]/10 via-[#89D4FF]/10 to-[#44ACFF]/10 rounded-3xl shadow-inner">
      <div className="max-w-md w-full space-y-8 bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-soft">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 bg-brand-pink/20 rounded-2xl items-center justify-center text-brand-pink mb-2 shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">
            Welcome back!
          </h2>
          <p className="text-sm text-text-secondary font-medium">
            Log in to continue your English spacing review journey.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl p-4 flex items-start gap-2.5 text-sm font-semibold animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your username or email"
                  className="pl-12 w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary font-medium transition duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-brand-blue hover:text-brand-pink transition duration-200">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-12 w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary font-medium transition duration-200"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 text-white rounded-full font-bold shadow-pastel hover:scale-[1.02] active:scale-[0.98] transition-all-180 flex items-center justify-center text-base"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-gray-50 text-sm">
          <span className="text-text-secondary">Don't have an account? </span>
          <Link to="/register" className="font-bold text-brand-blue hover:text-brand-pink transition duration-200">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
