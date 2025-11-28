import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper to get posts
async function getPosts() {
  const { data } = await supabase.from('posts').select('id');
  return data || [];
}

// Helper to get single post
async function getPost(id: string) {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

// Generate static params for static site generation if desired, but for now dynamic is fine.
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post: any) => ({
    id: post.id.toString(),
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  // Helper to normalize images array
  const images = post.images && Array.isArray(post.images) && post.images.length > 0 
    ? post.images 
    : (post.image ? [post.image] : []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-accent-5 mb-4 inline-block">
          ← Back to Blog
        </Link>
        
        {/* Multiple Images Grid / Slider */}
        {images.length > 0 && (
          <div className={`grid gap-4 mb-8 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {images.map((img: string, index: number) => (
              <div key={index} className={`w-full overflow-hidden rounded-lg bg-gray-50 ${images.length === 1 ? 'aspect-[2/1]' : 'aspect-square'}`}>
                <img 
                  src={img} 
                  alt={`${post.title} - ${index + 1}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-sm text-gray-500 border-b border-gray-100 pb-8">
          Published on {post.date}
        </div>
      </div>

      <article className="prose prose-lg prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
