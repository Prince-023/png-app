import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  request: NextRequest,
  context: { params: { [key: string]: string | string[] } }
) {
  try {
    const { id } = context.params;
    const dataPath = join(process.cwd(), 'data', 'images.json');
    const data = await readFile(dataPath, 'utf-8');
    const images = JSON.parse(data);

    const imageIndex = images.findIndex((img: any) => img.id === id);
    if (imageIndex === -1) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const image = images[imageIndex];
    const filepath = join(process.cwd(), 'public', 'uploads', image.filename);

    // Delete file
    try {
      await unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Remove from JSON
    images.splice(imageIndex, 1);
    await writeFile(dataPath, JSON.stringify(images, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
} 