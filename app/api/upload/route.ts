import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('portfolio-assets')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('portfolio-assets')
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
