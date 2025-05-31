import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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

    // Create unique filename
    const uniqueId = uuidv4();
    const filename = `${uniqueId}-${file.name}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Save metadata
    const imageData: ImageData = {
      id: uniqueId,
      filename,
      uploadedAt: new Date().toISOString()
    };

    // Read existing data
    const dataPath = join(process.cwd(), 'data', 'images.json');
    let images: ImageData[] = [];
    try {
      const data = await readFile(dataPath, 'utf-8');
      images = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, that's okay
    }

    // Add new image data
    images.push(imageData);

    // Write updated data
    await writeFile(dataPath, JSON.stringify(images, null, 2));

    return NextResponse.json({ success: true, image: imageData });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 