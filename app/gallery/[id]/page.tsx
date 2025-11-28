import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

async function getGalleries() {
  const { data } = await supabase.from('galleries').select('id');
  return data || [];
}

async function getGallery(id: string) {
  const { data } = await supabase
    .from('galleries')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

export async function generateStaticParams() {
  const galleries = await getGalleries();
  return galleries.map((g: any) => ({
    id: g.id.toString(),
  }));
}

export default async function GalleryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gallery = await getGallery(id);

  if (!gallery) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <Link href="/gallery" className="text-sm text-gray-500 hover:text-black mb-4 inline-block font-bold">
          ← Back to Galleries
        </Link>
        <h1 className="text-4xl font-bold mb-4">{gallery.title}</h1>
      </div>

      <div className="flex flex-col gap-8">
        {(!gallery.images || gallery.images.length === 0) && (
            <p className="text-gray-500 italic">No images in this gallery yet.</p>
        )}

        {gallery.images?.map((img: string, index: number) => (
          <div key={index} className="w-full">
             <img 
               src={img} 
               alt={`${gallery.title} - ${index + 1}`} 
               className="w-full h-auto object-contain bg-gray-50"
             />
          </div>
        ))}
      </div>
    </div>
  );
}
