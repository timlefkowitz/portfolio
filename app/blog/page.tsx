import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getPosts() {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false });
  return data || [];
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-12">Blog</h1>

      <div className="space-y-12">
        {posts.map((post: any) => {
          // Use first image from array, or fallback to single image field
          const displayImage = (post.images && post.images.length > 0) ? post.images[0] : post.image;

          return (
            <article key={post.id} className="group">
              {displayImage && (
                <div className="mb-6 overflow-hidden rounded-lg aspect-[2/1] w-full bg-gray-100">
                  <img 
                    src={displayImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
                <Link href={`/blog/${post.id}`} className="text-2xl font-bold hover:text-accent-1 transition-colors">
                  {post.title}
                </Link>
                <span className="text-sm text-gray-400">[{post.date}]</span>
              </div>
              <p className="text-gray-700 max-w-2xl mb-3 leading-relaxed">
                {post.excerpt}
              </p>
              <div>
                 <Link href={`/blog/${post.id}`} className="text-sm text-accent-2 hover:underline">
                  read more →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
