import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-accent-5 mb-4 inline-block">
          ← Back to Blog
        </Link>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-sm text-gray-500 border-b border-gray-100 pb-8">
          Published on {post.date}
        </div>
      </div>

      <div className="prose prose-lg prose-indigo max-w-none text-gray-700">
        {/* In a real app, use a markdown parser here. For now, just raw text/paragraphs */}
        {post.content.split('\n').map((paragraph: string, i: number) => (
          <p key={i} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
