import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('pngs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading images:', error);
    return NextResponse.json({ error: 'Failed to read images' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Get all images from Supabase
    const { data: images, error: fetchError } = await supabase
      .from('pngs')
      .select('*');

    if (fetchError) throw fetchError;

    // Delete all images from Cloudinary
    for (const image of images || []) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (error) {
        console.error(`Error deleting image ${image.public_id}:`, error);
      }
    }

    // Delete all records from Supabase
    const { error: deleteError } = await supabase
      .from('pngs')
      .delete()
      .neq('id', 0); // Delete all records

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'All images cleared successfully' });
  } catch (error) {
    console.error('Error clearing images:', error);
    return NextResponse.json({ error: 'Failed to clear images' }, { status: 500 });
  }
} 