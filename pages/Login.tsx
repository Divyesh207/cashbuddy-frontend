import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Eye, EyeOff, AlertCircle, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { API_URL, RECAPTCHA_SITE_KEY } from '../constants';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const Login = () => {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Resend Timer
  const [resendTimer, setResendTimer] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const recaptchaWidgetId = useRef<number | null>(null);

  useEffect(() => {
    if (step === 'credentials' && window.grecaptcha && window.grecaptcha.render) {
      try {
        if (recaptchaWidgetId.current !== null) {
          try {
            window.grecaptcha.reset(recaptchaWidgetId.current);
          } catch (e) {
            recaptchaWidgetId.current = null;
          }
        }

        if (recaptchaWidgetId.current === null) {
          const element = document.getElementById('login-recaptcha');
          if (element) {
            recaptchaWidgetId.current = window.grecaptcha.render('login-recaptcha', {
              'sitekey': RECAPTCHA_SITE_KEY,
            });
          }
        }
      } catch (e) {
        console.error("Recaptcha render error", e);
      }
    }
  }, [step]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (recaptchaWidgetId.current === null) {
      setError("ReCAPTCHA not loaded.");
      return;
    }

    const token = window.grecaptcha.getResponse(recaptchaWidgetId.current);
    if (!token) {
      setError("Please verify you are not a robot.");
      return;
    }

    // Optimistic UI: Transition immediately
    setStep('otp');
    setResendTimer(30);
    // Mark widget as needing re-init if we come back
    recaptchaWidgetId.current = null;

    // Perform request in background
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, recaptcha_token: token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          // Revert UI on failure
          setStep('credentials');
          setResendTimer(0);
          setError(data.detail || "Login failed. Please check credentials.");
        }
      })
      .catch((err) => {
        console.error(err);
        // Revert UI on network error
        setStep('credentials');
        setResendTimer(0);
        setError("Cannot connect to server. Ensure Backend is running.");
      });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "OTP verification failed");
      }

      login(data.access_token, { ...data.user });
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    try {
      setResendTimer(30); // Start timer immediately
      await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason: 'login' }),
      });
      alert("New OTP sent to your email.");
    } catch (err) {
      setError("Failed to resend OTP.");
      setResendTimer(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse delay-1000"></div>

      <div className="glass-card w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-slate-800 p-8 relative z-10 transition-all duration-500 hover:shadow-emerald-500/10 scale-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-4 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30 transform hover:scale-110 transition-transform duration-300">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
            {step === 'credentials' ? 'Welcome Back' : 'Verify Login'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-center font-medium">
            {step === 'credentials' ? 'Secure access to your financial world' : `Enter code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center space-x-3 animate-fade-in shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline transition-colors pb-0.5">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-center my-6 scale-90 origin-center">
              <div id="login-recaptcha" className="shadow-md rounded-lg overflow-hidden"></div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-lg shadow-xl shadow-emerald-500/20 flex justify-center items-center space-x-2 group"
            >
              <span>Continue Securely</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
            <div className="text-center">
              <input
                type="text"
                placeholder="------"
                maxLength={6}
                required
                autoFocus
                className="w-full text-center tracking-[0.75em] text-3xl font-bold font-display px-4 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white transition-all shadow-inner"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-2">Enter the 6-digit verification code</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary w-full py-3.5 text-lg shadow-xl shadow-emerald-500/20 flex justify-center items-center space-x-2 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Verify & Login</span>
                </>
              )}
            </button>

            <div className="flex flex-col space-y-3 pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                className={`flex items-center justify-center space-x-2 text-sm font-medium transition-colors ${resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500'}`}
              >
                <RefreshCw className={`w-4 h-4 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                <span>{resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Verification Code'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {step === 'credentials' && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account? <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-500 hover:underline transition-colors">Sign up for free</Link>
          </div>
        )}
      </div>

      <div className="mt-8 text-slate-400 dark:text-slate-600 text-xs font-medium">
        &copy; {new Date().getFullYear()} CashBuddy. Secure Financial Tracking.
      </div>
    </div>
  );
};

export default Login;