import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { supabase } from '@/lib/supabase';

interface ImageData {
  id: string;
  filename: string;
  uploadedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!file.type.includes('png')) {
      return NextResponse.json(
        { error: 'Only PNG files are allowed' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalFilename = file.name;

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

    return NextResponse.json({ success: true, image: data });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 