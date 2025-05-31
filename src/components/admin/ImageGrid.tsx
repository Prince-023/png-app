'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface ImageData {
  id: string;
  url: string;
  public_id: string;
  filename: string;
  created_at: string;
}

export default function ImageGrid() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('pngs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      setError('Failed to load images');
      console.error('Error fetching images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, public_id: string) => {
    try {
      // Delete from Cloudinary
      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_id }),
      });

      if (!response.ok) throw new Error('Failed to delete image from Cloudinary');

      // Delete from Supabase
      const { error } = await supabase
        .from('pngs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setImages(images.filter(img => img.id !== id));
    } catch (err) {
      setError('Failed to delete image');
      console.error('Error deleting image:', err);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      // Ensure filename has .png extension
      const downloadFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image');
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (images.length === 0) return <div className="text-center py-4">No images uploaded yet</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <div key={image.id} className="relative group bg-white rounded-lg shadow-md overflow-hidden">
          <div className="aspect-square relative">
            <Image
              src={image.url}
              alt={image.filename}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 truncate" title={image.filename}>
                  {image.filename}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(image.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleDownload(image.url, image.filename)}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button
                onClick={() => handleDelete(image.id, image.public_id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 