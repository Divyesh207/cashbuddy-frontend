import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
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
        // Since the DOM element is removed/re-added, we treat it as a new render if we came back from OTP step
        // However, if the widgetId exists but the element is gone, reset() throws.
        // We cleared widgetId when moving to OTP, so this should strictly handle new renders.
        if (recaptchaWidgetId.current !== null) {
           try {
             window.grecaptcha.reset(recaptchaWidgetId.current);
           } catch(e) {
             // If reset fails (element gone), re-render
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
      setError("Please complete the reCAPTCHA verification."); 
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-500 p-3 rounded-xl mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 'credentials' ? 'Welcome Back' : 'Verify Login'}
          </h1>
          <p className="text-slate-500 mt-2 text-center">
            {step === 'credentials' ? 'Secure login to CashBuddy' : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="cashbuddy@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-emerald-600 hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-center my-4">
              <div id="login-recaptcha"></div>
            </div>

            <button
              type="submit"
              className={`w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors`}
            >
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="------"
                maxLength={6}
                required
                className="w-full text-center tracking-[0.5em] text-2xl font-bold px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Checking...' : 'Verify & Login'}
            </button>
            
            <div className="flex flex-col space-y-2 mt-4">
                <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`flex items-center justify-center space-x-2 text-sm ${resendTimer > 0 ? 'text-slate-400' : 'text-emerald-600 hover:text-emerald-700'}`}
                >
                    <RefreshCw className={`w-4 h-4 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                    <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
                </button>

                <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                className="text-slate-500 hover:text-slate-700 text-sm"
                >
                Back to Login
                </button>
            </div>
          </form>
        )}

        {step === 'credentials' && (
          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Sign up</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;