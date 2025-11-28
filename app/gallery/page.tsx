import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Revalidate every 60 seconds
export const revalidate = 60;

// Helper to get galleries
async function getGalleries() {
  const { data } = await supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function GalleryPage() {
  const galleries = await getGalleries();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-12">Galleries</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleries.length === 0 && (
           <p className="text-gray-500 italic col-span-3">No galleries found.</p>
        )}

        {galleries.map((gallery: any) => (
          <Link href={`/gallery/${gallery.id}`} key={gallery.id} className="block">
            <div className="relative group aspect-square overflow-hidden bg-gray-100 cursor-pointer">
              {gallery.thumbnail ? (
                <img 
                  src={gallery.thumbnail} 
                  alt={gallery.title} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
              ) : (
                <div className={`w-full h-full ${gallery.color || 'bg-gray-200'} opacity-50 group-hover:opacity-100 transition-all duration-500`} />
              )}
              
              <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
                <span className="text-black font-bold bg-white/80 px-3 py-2 backdrop-blur-sm block w-fit">
                  {gallery.title}
                </span>
                <span className="text-xs text-black/60 bg-white/80 px-3 pb-2 backdrop-blur-sm block w-fit -mt-1">
                  {gallery.images?.length || 0} images
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
