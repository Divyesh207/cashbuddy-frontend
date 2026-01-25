import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Eye, EyeOff, RefreshCw } from 'lucide-react';
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
           } catch(e) {
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-500 p-3 rounded-xl mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 'register' ? 'Create Account' : 'Verify Email'}
          </h1>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="flex justify-center my-4">
               <div id="register-recaptcha"></div>
            </div>

            <button 
                type="submit" 
                className={`w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700`}
            >
              Get Started
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-slate-500 text-center">Enter the 6-digit code sent to {formData.email}</p>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              className="w-full text-center tracking-widest text-2xl px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 ${isLoading ? 'opacity-70' : ''}`}
            >
              {isLoading ? 'Verifying...' : 'Verify Account'}
            </button>

            <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                className={`w-full flex items-center justify-center space-x-2 text-sm ${resendTimer > 0 ? 'text-slate-400' : 'text-emerald-600 hover:text-emerald-700'}`}
            >
                <RefreshCw className={`w-4 h-4 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
                <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
            </button>

             <button
                type="button"
                onClick={() => { setStep('register'); setOtp(''); setError(''); }}
                className="w-full text-slate-500 hover:text-slate-700 text-sm mt-2"
                >
                Back to Details
            </button>
          </form>
        )}
        
        {step === 'register' && (
           <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Log in</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;