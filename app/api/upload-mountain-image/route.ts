import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mountainId = formData.get('mountainId') as string | null;

    if (!file || !mountainId) {
      return NextResponse.json({ error: 'File dan mountainId diperlukan' }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Hanya JPEG, PNG, atau WEBP yang diizinkan' }, { status: 400 });
    }

    // Validasi ukuran (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    // Tentukan ekstensi berdasarkan tipe file
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const ext = extMap[file.type] || 'jpg';
    const fileName = `${mountainId}.${ext}`;

    // Pastikan folder public/mountains ada
    const mountainsDir = path.join(process.cwd(), 'public', 'mountains');
    await mkdir(mountainsDir, { recursive: true });

    // Tulis file
    const filePath = path.join(mountainsDir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Return URL publik
    const publicUrl = `/mountains/${fileName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Gagal mengupload: ' + error.message }, { status: 500 });
  }
}
