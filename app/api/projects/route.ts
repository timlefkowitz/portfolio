import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false }); // Fallback

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  // DELETE
  if (body.method === 'DELETE') {
    const { error } = await supabase.from('projects').delete().eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // REORDER
  if (body.method === 'REORDER') {
    // Upsert multiple items to update their display_order
    // Assuming body.data is an array of projects with updated indices as display_order
    const updates = body.data.map((project: any, index: number) => ({
      id: project.id,
      display_order: index,
      title: project.title, // Required fields for upsert if not partial
      description: project.description // Simplified, ideally just update order
    }));

    // For simplicity/safety in SQL, we might loop or use a specific RPC. 
    // Standard upsert works if we include all required fields or if fields are nullable/default.
    // A safer way for just ordering:
    for (let i = 0; i < body.data.length; i++) {
       await supabase.from('projects').update({ display_order: i }).eq('id', body.data[i].id);
    }
    
    return NextResponse.json({ success: true });
  }

  // UPDATE
  if (body.method === 'PUT') {
    const { data, error } = await supabase
      .from('projects')
      .update(body.data)
      .eq('id', body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // CREATE
  const { title, description, year, tags, category, link } = body;
  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description required' }, { status: 400 });
  }

  const newProject = {
    title,
    description,
    year: year || new Date().getFullYear().toString(),
    tags: tags || [],
    category: category || 'Software',
    link: link || '#',
    display_order: 999 // Put at end by default
  };

  const { data, error } = await supabase
    .from('projects')
    .insert(newProject)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
