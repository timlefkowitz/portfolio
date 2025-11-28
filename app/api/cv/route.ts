import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // We'll just grab the most recent CV entry
  const { data, error } = await supabase
    .from('cv')
    .select('data')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return NextResponse.json(null);
  return NextResponse.json(data.data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // We always create a new version or update the latest. 
    // For simplicity, let's just insert a new version to keep history, or update row 1 if we want single source.
    // Let's just insert new for history tracking in DB
    const { data, error } = await supabase
      .from('cv')
      .insert({ data: body })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save CV' }, { status: 500 });
  }
}
