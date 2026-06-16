'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import { fetchApi } from '@/lib/api';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (otpCode: string) => {
    setError('');
    setIsLoading(true);

    try {
      const data = await fetchApi('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otpCode }),
      });

      localStorage.setItem('token', data.token);

      if (data.needsOnboarding) {
        router.push('/onboarding');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      // We can use forgot-password endpoint or a specific resend-otp endpoint to generate a new OTP
      await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setCountdown(60);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Email</h1>
        <p className="text-gray-500 mt-2">
          We've sent a 6-digit verification code to <br/>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>
        </p>
      </div>

      <div className="mb-8 flex flex-col items-center">
        <OTPInput length={6} onComplete={handleVerify} error={error} />
      </div>

      <div className="text-center space-y-4">
        {isLoading && <p className="text-sm text-gray-500">Verifying...</p>}

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span className="text-gray-400">Resend in {countdown}s</span>
          ) : (
            <button 
              onClick={handleResend}
              disabled={isLoading}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Resend Code
            </button>
          )}
        </p>

        <Button 
          variant="ghost" 
          className="text-sm w-full"
          onClick={() => router.push('/login')}
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
}
