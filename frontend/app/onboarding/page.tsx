'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { fetchApi } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 1 && !name) {
      setError('Name is required');
      return;
    }
    if (step === 2 && !skills) {
      setError('Please add at least one skill');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!goal || !deadline) {
      setError('Goal and deadline are required');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await fetchApi('/auth/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify({ name, skills, goal, deadline }),
      });
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                  {i}
                </div>
                {i < 3 && (
                  <div className={`w-24 h-1 mx-2 rounded ${step > i ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 1 ? 'Personal Info' : step === 2 ? 'Your Skills' : 'Goals & Deadline'}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6 min-h-[200px]">
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="What should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="Skills"
                placeholder="e.g. JavaScript, React, Python"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <p className="text-sm text-gray-500">Separate skills with commas</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Input
                label="Your Main Goal"
                placeholder="e.g. Become a Senior Frontend Developer"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              <Input
                label="Target Deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || isLoading}
            className={step === 1 ? 'invisible' : ''}
          >
            Back
          </Button>
          
          {step < 3 ? (
            <Button onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={isLoading}>
              Complete
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
