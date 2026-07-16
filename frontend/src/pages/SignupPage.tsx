import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, type Role } from '../context/AuthContext';
import { Activity, User, Mail, Lock, Shield, UserCog, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('SRE');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pwd: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return pwd.length >= minLength && hasUpper && hasNumber && hasSpecial;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Full Name is required');
    if (!validateEmail(email)) return setError('Invalid email format');
    if (!validatePassword(password)) {
      return setError('Password must be at least 8 chars, contain 1 uppercase, 1 number, and 1 special character.');
    }

    try {
      await register(name, email, role, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[var(--color-light-bg)]">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[100px] pointer-events-none opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[100px] pointer-events-none opacity-60"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card-glass w-full max-w-lg p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-[0_8px_16px_rgba(37,99,235,0.1)]">
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">
            Create an Account
          </h2>
          <p className="text-slate-500 mt-2 text-sm">Join the IntelliRCA platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-3d pl-11"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-3d pl-11"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-3d pl-11"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Select Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  role === 'Admin' 
                    ? 'border-blue-600 bg-blue-50 shadow-[0_4px_12px_rgba(37,99,235,0.15)]' 
                    : 'border-transparent bg-[var(--color-light-elevated)] hover:bg-slate-200'
                }`}
              >
                <UserCog className={`w-6 h-6 mb-2 ${role === 'Admin' ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className={`text-sm font-bold ${role === 'Admin' ? 'text-blue-700' : 'text-slate-600'}`}>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('SRE')}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  role === 'SRE' 
                    ? 'border-indigo-600 bg-indigo-50 shadow-[0_4px_12px_rgba(79,70,229,0.15)]' 
                    : 'border-transparent bg-[var(--color-light-elevated)] hover:bg-slate-200'
                }`}
              >
                <Shield className={`w-6 h-6 mb-2 ${role === 'SRE' ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span className={`text-sm font-bold ${role === 'SRE' ? 'text-indigo-700' : 'text-slate-600'}`}>SRE</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 mt-4 text-base shadow-[0_8px_16px_rgba(37,99,235,0.2)]"
          >
            Create Account <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
