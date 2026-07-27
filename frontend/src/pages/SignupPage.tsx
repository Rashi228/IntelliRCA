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
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-200 to-blue-600 font-sans pt-24 pb-12">
      {/* Top Header Bar like Photo */}
      <nav className="w-full bg-blue-600 py-4 px-8 flex items-center justify-between text-white shadow-md absolute top-0 left-0 right-0 z-20">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          IntelliRCA
        </Link>
        <Link to="/login" className="px-5 py-2 rounded-lg border border-white/40 bg-blue-600/80 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm">
          Sign In
        </Link>
      </nav>

      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-[120px] pointer-events-none opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-300 rounded-full blur-[120px] pointer-events-none opacity-40"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 relative z-10 border border-blue-100 my-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 shadow-[0_4px_12px_rgba(37,99,235,0.15)]">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Create an Account
          </h2>
          <p className="text-slate-500 mt-0.5 text-xs font-medium">Join the IntelliRCA platform</p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 bg-blue-50/70 border border-blue-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 bg-blue-50/70 border border-blue-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 bg-blue-50/70 border border-blue-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 transition-all cursor-pointer ${
                  role === 'Admin' 
                    ? 'border-blue-600 bg-blue-50 shadow-sm' 
                    : 'border-slate-200 bg-slate-50 hover:bg-blue-50/40'
                }`}
              >
                <UserCog className={`w-4.5 h-4.5 ${role === 'Admin' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${role === 'Admin' ? 'text-blue-700' : 'text-slate-600'}`}>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('SRE')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 transition-all cursor-pointer ${
                  role === 'SRE' 
                    ? 'border-blue-600 bg-blue-50 shadow-sm' 
                    : 'border-slate-200 bg-slate-50 hover:bg-blue-50/40'
                }`}
              >
                <Shield className={`w-4.5 h-4.5 ${role === 'SRE' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${role === 'SRE' ? 'text-blue-700' : 'text-slate-600'}`}>SRE</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer border-none text-sm mt-4 flex items-center justify-center gap-2"
          >
            Create Account <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
