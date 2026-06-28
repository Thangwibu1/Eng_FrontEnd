import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import { Sparkles, Mail, Lock, User, AlertCircle } from 'lucide-react';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const registerMutation = useRegister();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        username,
        email,
        password,
        confirmPassword,
      });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error?.message || 'Registration failed. Try a different username/email.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-[#FE9EC7]/10 via-[#89D4FF]/10 to-[#44ACFF]/10 rounded-3xl shadow-inner animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-soft">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 bg-brand-pink/20 rounded-2xl items-center justify-center text-brand-pink mb-2 shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">
            Create an Account
          </h2>
          <p className="text-sm text-text-secondary font-medium">
            Start tracking vocabularies and creating flashcard decks today!
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl p-4 flex items-start gap-2.5 text-sm font-semibold animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. janesmith"
                  className="pl-12 w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary font-medium transition duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jane@example.com"
                  className="pl-12 w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary font-medium transition duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
                Password
              </label>
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

            <div>
              <label htmlFor="confirmPassword" className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-12 w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary font-medium transition duration-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-12 bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 text-white rounded-full font-bold shadow-pastel hover:scale-[1.02] active:scale-[0.98] transition-all-180 flex items-center justify-center text-base"
            >
              {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-gray-50 text-sm">
          <span className="text-text-secondary">Already have an account? </span>
          <Link to="/login" className="font-bold text-brand-blue hover:text-brand-pink transition duration-200">
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
