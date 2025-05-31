'use server';

import { cloudinary } from '@/lib/cloudinary';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function uploadToCloudinary(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Check if file is PNG
    if (!file.type.includes('image/png')) {
      throw new Error('Only PNG files are allowed');
    }

    // Get original filename
    const originalFilename = file.name;

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'png-gallery',
          allowed_formats: ['png'],
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const cloudinaryResult = result as any;

    // Store metadata in Supabase
    const { data, error } = await supabase
      .from('pngs')
      .insert([
        {
          url: cloudinaryResult.secure_url,
          public_id: cloudinaryResult.public_id,
          filename: originalFilename,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error('Failed to store image metadata');
    }

    // Revalidate the gallery and admin pages
    revalidatePath('/gallery');
    revalidatePath('/admin');

    return {
      success: true,
      data: {
        id: data.id,
        url: data.url,
        public_id: data.public_id,
        filename: data.filename,
        created_at: data.created_at,
      },
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
} 