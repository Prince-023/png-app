import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const { public_id } = await request.json();

    if (!public_id) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error: Error | undefined, result: any) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
} 