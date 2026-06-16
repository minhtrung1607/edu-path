'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { fetchApi } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    skills: '',
    goal: '',
    deadline: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    try {
      const data = await fetchApi('/profile');
      setUser(data);
      if (data.student) {
        setFormData({
          name: data.student.name || '',
          avatar: data.student.avatar || '',
          skills: data.student.skills || '',
          goal: data.student.goal || '',
          deadline: data.student.deadline ? new Date(data.student.deadline).toISOString().split('T')[0] : '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      if (err.message.includes('Unauthorized')) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      await fetchApi('/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setMessage('Profile updated successfully');
      setIsEditing(false);
      loadProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{formData.name ? formData.name.charAt(0) : 'U'}</span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{formData.name || 'Student'}</h1>
                <p className="text-blue-100 mt-1">{user?.email}</p>
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mt-2">
                  {user?.role}
                </span>
              </div>
            </div>
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{message}</div>}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <Input
                  label="Avatar URL"
                  value={formData.avatar}
                  onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                />
                <div className="col-span-1 md:col-span-2">
                  <Input
                    label="Skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  />
                </div>
                <Input
                  label="Goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                />
                <Input
                  label="Deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Skills</h3>
                <p className="text-gray-900 dark:text-white font-medium">{formData.skills || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Goal</h3>
                <p className="text-gray-900 dark:text-white font-medium">{formData.goal || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target Deadline</h3>
                <p className="text-gray-900 dark:text-white font-medium">
                  {formData.deadline ? new Date(formData.deadline).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
