import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      login(email);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[var(--color-light-bg)]">
      {/* Background glowing effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[100px] pointer-events-none opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[100px] pointer-events-none opacity-60"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-glass w-full max-w-md p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-[0_8px_16px_rgba(37,99,235,0.1)]">
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">
            Welcome Back
          </h2>
          <p className="text-slate-500 mt-2 text-sm">Sign in to your IntelliRCA account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-500">Forgot password?</a>
            </div>
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

          <button
            type="submit"
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 mt-8 text-base shadow-[0_8px_16px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_10px_rgba(37,99,235,0.3)]"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">
            Sign up now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
