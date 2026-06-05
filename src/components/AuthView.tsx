import React, { useState } from 'react';
import { useAppState } from '../context/AppContext.tsx';
import { Mail, Lock, User, Wallet, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthView: React.FC = () => {
  const { login, register } = useAppState();
  const [isLogin, setIsLogin] = useState(true);
  
  // Registration / Logins inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
        setLoading(false);
      }
    } else {
      if (!name.trim()) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      const res = await register(name, email, password);
      if (!res.success) {
        setError(res.error || 'Failed to register account');
        setLoading(false);
      }
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    const res = await login('alex@example.com', 'password123');
    if (!res.success) {
      setError(res.error || 'Demo login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] p-4 relative overflow-hidden">
      {/* GLOWING AMBIENT BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[450px] h-[450px] bg-gradient-to-tr from-indigo-650/15 to-purple-650/5 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[15%] w-[500px] h-[550px] bg-gradient-to-br from-emerald-650/15 to-teal-650/5 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md backdrop-blur-xl bg-[#080d1a]/70 p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-white/5 border border-white/10 rounded-2xl text-emerald-400 mb-3 animate-bounce">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">
            SaaS Wealth Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-sans">
            Professional multi-user portfolio database metrics dashboard.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-rose-500/10 border border-rose-550/20 rounded-xl text-rose-350 text-xs text-center font-medium font-sans"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#10b981] transition-all"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#10b981] transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="auth-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#10b981] transition-all"
              required
            />
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/30"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-5 relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/5" />
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest bg-transparent font-mono">Or</span>
          <div className="flex-grow border-t border-white/5" />
        </div>

        <button
          id="demo-auth-btn"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Sign In with Demo Sandbox Account</span>
        </button>

        <div className="text-center mt-6">
          <button
            id="auth-toggle-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-slate-400 hover:text-white transition-colors font-medium font-sans cursor-pointer"
          >
            {isLogin ? (
              <>Don't have an account? <span className="text-[#10b981] font-bold underline underline-offset-2">Register Now</span></>
            ) : (
              <>Already have an account? <span className="text-[#10b981] font-bold underline underline-offset-2">Sign In</span></>
            )}
          </button>
        </div>

        <div className="mt-8 border-t border-white/5 pt-4 flex flex-col items-center gap-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            256-Bit SSL Secured Cryptography Active
          </div>
          <div className="font-sans">Password: <span className="font-mono text-slate-350">password123</span> | Account: <span className="font-mono text-slate-350">alex@example.com</span></div>
        </div>
      </motion.div>
    </div>
  );
};
