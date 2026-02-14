import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Eye, EyeOff, RefreshCw, UserPlus, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { API_URL, RECAPTCHA_SITE_KEY } from '../constants';

const Register = () => {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const recaptchaWidgetId = useRef<number | null>(null);

  useEffect(() => {
    if (step === 'register' && window.grecaptcha && window.grecaptcha.render) {
      try {
        if (recaptchaWidgetId.current !== null) {
          try {
            window.grecaptcha.reset(recaptchaWidgetId.current);
          } catch (e) {
            recaptchaWidgetId.current = null;
          }
        }

        if (recaptchaWidgetId.current === null) {
          const element = document.getElementById('register-recaptcha');
          if (element) {
            recaptchaWidgetId.current = window.grecaptcha.render('register-recaptcha', {
              'sitekey': RECAPTCHA_SITE_KEY,
            });
          }
        }
      } catch (e) {
        console.error("Recaptcha error", e);
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (recaptchaWidgetId.current === null) {
      setError("ReCAPTCHA loading...");
      return;
    }

    const token = window.grecaptcha.getResponse(recaptchaWidgetId.current);
    if (!token) {
      setError("Please verify you are not a robot.");
      return;
    }

    // Optimistic UI: Transition to OTP step immediately
    setStep('otp');
    setResendTimer(30);
    // Mark widget as needing re-init if we revert
    recaptchaWidgetId.current = null;

    // Call API in background
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, recaptcha_token: token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          // Revert on failure
          setStep('register');
          setResendTimer(0);
          setError(data.detail || "Registration failed. Email might be taken.");
        }
      })
      .catch((err) => {
        setStep('register');
        setResendTimer(0);
        setError("Network error. Please try again.");
      });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      if (!res.ok) throw new Error('Invalid OTP');

      // Set onboarding flag for the new user
      localStorage.setItem('need_onboarding', 'true');

      alert('Registration Successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
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
        body: JSON.stringify({ email: formData.email, reason: 'register' }),
      });
      alert("OTP resent to email.");
    } catch (err) {
      setError("Failed to resend OTP.");
      setResendTimer(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse delay-700"></div>

      <div className="glass-card w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-slate-800 p-8 relative z-10 transition-all duration-500 hover:shadow-emerald-500/10 scale-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30 transform hover:scale-110 transition-transform duration-300">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
            {step === 'register' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-center font-medium">
            {step === 'register' ? 'Join CashBuddy for free today' : `Enter code sent to ${formData.email}`}
          </p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-xl text-sm font-medium animate-fade-in">{error}</div>}

        {step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ritesh Mali"
                  required
                  className="input-field pl-10"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
                <div className="absolute left-3 top-3 text-slate-400"><Wallet className="w-5 h-5" /></div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <div className="absolute left-3 top-3 text-slate-400"><Mail className="w-5 h-5" /></div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <div className="absolute left-3 top-3 text-slate-400"><Lock className="w-5 h-5" /></div>
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-center my-6 scale-90 origin-center text-center">
              <div id="register-recaptcha" className="shadow-md rounded-lg overflow-hidden"></div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-lg shadow-xl shadow-emerald-500/20 flex justify-center items-center space-x-2 group from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 ring-2 ring-indigo-500/20"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6 animate-fade-in">
            <div className="text-center">
              <input
                type="text"
                placeholder="------"
                maxLength={6}
                required
                autoFocus
                className="w-full text-center tracking-[0.75em] text-3xl font-bold font-display px-4 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white transition-all shadow-inner"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-2">Enter the verification code</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary w-full py-3.5 text-lg shadow-xl shadow-indigo-500/20 flex justify-center items-center space-x-2 from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Verify Account</span>
                </>
              )}
            </button>

            <div className="flex flex-col space-y-3 pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                className={`flex items-center justify-center space-x-2 text-sm font-medium transition-colors ${resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500'}`}
              >
                <RefreshCw className={`w-4 h-4 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                <span>{resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Verification Code'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setStep('register'); setOtp(''); setError(''); }}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition-colors"
              >
                ← Back to Details
              </button>
            </div>
          </form>
        )}

        {step === 'register' && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 hover:underline transition-colors">Log in here</Link>
          </div>
        )}
      </div>

      <div className="mt-8 text-slate-400 dark:text-slate-600 text-xs font-medium">
        &copy; {new Date().getFullYear()} CashBuddy. Join the financial revolution.
      </div>
    </div>
  );
};

export default Register;