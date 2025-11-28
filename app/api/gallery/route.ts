import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  // DELETE
  if (body.method === 'DELETE') {
    const { error } = await supabase.from('galleries').delete().eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // UPDATE
  if (body.method === 'PUT') {
    const { data, error } = await supabase
      .from('galleries')
      .update(body.data)
      .eq('id', body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // CREATE
  const { title, thumbnail, color, images } = body;
  const newGallery = {
    title: title || 'Untitled Gallery',
    thumbnail: thumbnail || '',
    color: color || 'bg-gray-200',
    images: images || []
  };

  const { data, error } = await supabase
    .from('galleries')
    .insert(newGallery)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to save gallery' }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
