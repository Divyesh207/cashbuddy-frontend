import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, KeyRound, CheckCircle, RefreshCw } from 'lucide-react';
import { API_URL } from '../constants';

const ForgotPassword = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Optimistic UI: Directly land on OTP section
    setStep('reset');
    setResendTimer(30);

    // Send OTP in the background
    fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          // Revert on failure
          setStep('request');
          setResendTimer(0);
          setError(data.detail || 'Failed to send OTP. User may not exist.');
        } else {
          setMessage('OTP sent to your email.');
        }
      })
      .catch((err) => {
        console.error(err);
        setStep('request');
        setResendTimer(0);
        setError('Network error. Please try again.');
      });
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setMessage('');
    try {
      // Start timer immediately for better UX
      setResendTimer(30);

      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason: 'forgot_password' }),
      });

      if (!res.ok) throw new Error("Failed");

      setMessage("New OTP sent to your email.");
    } catch (err) {
      setError("Failed to resend OTP.");
      setResendTimer(0); // Allow retry
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to reset password');
      }

      alert('Password reset successfully. Please login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-500 p-3 rounded-full mb-4 shadow-lg shadow-emerald-200">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-slate-500 mt-2 text-center text-sm">
            {step === 'request' ? 'Enter your email to receive a secure code' : 'Set your new secure password'}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">{error}</div>}
        {message && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm text-center border border-emerald-100 flex justify-center items-center gap-2"><CheckCircle size={16} /> {message}</div>}

        {step === 'request' ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-slate-900 bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              // No loading state needed here as transition is instant
              className={`w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 font-medium transition-colors shadow-lg`}
            >
              Send Secure Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">OTP Code</label>
              <input
                type="text"
                placeholder="------"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center tracking-[0.5em] font-bold text-xl text-slate-900 bg-white"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 bg-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-lg shadow-emerald-200 ${isLoading ? 'opacity-70' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Verify & Update Password'}
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
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link to="/login" className="text-slate-500 text-sm hover:text-slate-800 flex items-center justify-center space-x-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;