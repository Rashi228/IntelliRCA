import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) return setError('Invalid email format');
    if (!validatePassword(password)) {
      return setError('Password must be at least 8 chars, contain 1 uppercase, 1 number, and 1 special character.');
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-200 to-blue-600 font-sans">
      {/* Top Header Bar like Photo */}
      <nav className="w-full bg-blue-600 py-4 px-8 flex items-center justify-between text-white shadow-md absolute top-0 left-0 right-0 z-20">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          IntelliRCA
        </Link>
        <Link to="/signup" className="px-5 py-2 rounded-lg border border-white/40 bg-blue-600/80 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm">
          Sign Up
        </Link>
      </nav>

      {/* Background glowing effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-300 rounded-full blur-[120px] pointer-events-none opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-[120px] pointer-events-none opacity-60"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 relative z-10 border border-blue-100 mt-12"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 shadow-[0_8px_16px_rgba(37,99,235,0.15)]">
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Welcome Back!
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">Login to your IntelliRCA account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pl-11 bg-blue-50/70 border border-blue-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pl-11 bg-blue-50/70 border border-blue-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="mt-2 text-left">
              <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer border-none text-base mt-6 flex items-center justify-center gap-2"
          >
            Login <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
