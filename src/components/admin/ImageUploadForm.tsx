'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadToCloudinary } from '@/app/actions/upload';

export default function ImageUploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pngFiles = acceptedFiles.filter(file => file.type === 'image/png');
    
    if (pngFiles.length === 0) {
      setError('Please upload PNG files only');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      for (const file of pngFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadToCloudinary(formData);
        
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      // Refresh the page to show new images
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png']
    }
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="text-blue-600">Uploading...</div>
        ) : isDragActive ? (
          <div className="text-blue-600">Drop the PNG files here...</div>
        ) : (
          <div>
            <p className="text-gray-600">Drag and drop PNG files here, or click to select files</p>
            <p className="text-sm text-gray-500 mt-2">Only PNG files are accepted</p>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}
    </div>
  );
} 