'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploadForm from '@/components/admin/ImageUploadForm';
import ImageGrid from '@/components/admin/ImageGrid';

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      // Check authentication
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [router]);

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all images? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/images', {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to clear images');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing images:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Clear All Images
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              router.push('/admin/login');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Logout
          </button>
        </div>
      </div>

      <ImageUploadForm />
      <ImageGrid />
    </div>
  );
} 