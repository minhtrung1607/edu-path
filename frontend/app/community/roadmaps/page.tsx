'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

interface Roadmap {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export default function PublicRoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      const data = await fetchApi('/public/roadmaps');
      setRoadmaps(data);
    } catch (error) {
      console.error('Failed to load roadmaps', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Community Roadmaps</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Explore learning paths shared by the EduPath community.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roadmaps.map((roadmap) => (
              <div key={roadmap.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition p-6 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{roadmap.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 flex-1 mb-4">{roadmap.description}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500">
                    {new Date(roadmap.createdAt).toLocaleDateString()}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
            
            {roadmaps.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                No public roadmaps available at the moment.
              </div>
            )}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-500 font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
