import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  // DELETE
  if (body.method === 'DELETE') {
    const { error } = await supabase.from('posts').delete().eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // UPDATE
  if (body.method === 'PUT') {
    const { data, error } = await supabase
      .from('posts')
      .update(body.data)
      .eq('id', body.id)
      .select()
      .single();
      
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // CREATE
  if (!body.title || !body.content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
  }

  const newPost = {
    title: body.title,
    content: body.content,
    excerpt: body.content.substring(0, 100) + '...',
    date: new Date().toISOString().split('T')[0]
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(newPost)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
