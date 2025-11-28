import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Revalidate data every 60 seconds or on-demand
export const revalidate = 60;

async function getRecentWork() {
  // Server-side direct fetch for better performance than internal API call during build
  // Fetch recent posts (limit 3)
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, excerpt, created_at, date')
    .order('date', { ascending: false })
    .limit(3);

  // Fetch recent projects (limit 3)
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, description, created_at, year, category')
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch recent galleries (limit 3)
  const { data: galleries } = await supabase
    .from('galleries')
    .select('id, title, created_at, thumbnail')
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch recent CV update (limit 1)
  const { data: cv } = await supabase
    .from('cv')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(1);

  // Combine and Normalize
  const updates = [
    ...(posts || []).map((p: any) => ({ ...p, type: 'blog', sortDate: p.date || p.created_at })),
    ...(projects || []).map((p: any) => ({ ...p, type: 'project', sortDate: p.created_at })),
    ...(galleries || []).map((g: any) => ({ ...g, type: 'gallery', sortDate: g.created_at })),
    ...(cv || []).map((c: any) => ({ ...c, type: 'cv', title: 'CV Updated', sortDate: c.created_at }))
  ];

  // Sort by date descending and take top 5
  return updates
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
    .slice(0, 5);
}

export default async function Home() {
  const recentWork = await getRecentWork();

  return (
    <div className="space-y-16">
      <section className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight flex hacker-blink">
          {"hi, i'm  tim.".split("").map((ch, i) => (
            <span
              key={i}
              className="hacker-letter"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {ch}
            </span>
          ))}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
          I explore the intersection of <span className="text-black font-medium">software</span> and <span className="text-black font-medium">sound</span>. 
          I build digital tools, restore vintage hardware, and build electronic instruments.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Recent Updates</h2>
        <div className="space-y-8">
          
          {recentWork.map((item: any, index: number) => {
            // Determine Link and Subtitle based on type
            let linkUrl = '/';
            let subtitle = '';
            let accentColor = 'hover:text-gray-900';
            let tagColor = 'text-gray-500';

            switch (item.type) {
              case 'blog':
                linkUrl = `/blog/${item.id}`;
                subtitle = `[${item.date}]`;
                accentColor = 'hover:text-accent-1';
                tagColor = 'text-accent-1';
                break;
              case 'project':
                linkUrl = '/projects'; // Or specific project page if you have one
                subtitle = `[${item.year}]`;
                accentColor = 'hover:text-accent-2';
                tagColor = 'text-accent-2';
                break;
              case 'gallery':
                linkUrl = `/gallery/${item.id}`;
                subtitle = '[gallery]';
                accentColor = 'hover:text-accent-3';
                tagColor = 'text-accent-3';
                break;
              case 'cv':
                linkUrl = '/cv';
                subtitle = '[resume]';
                accentColor = 'hover:text-accent-4';
                tagColor = 'text-accent-4';
                break;
            }

            return (
              <div key={`${item.type}-${item.id}`} className="group">
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
                  <Link href={linkUrl} className={`text-2xl font-bold ${accentColor} transition-colors`}>
                    {item.title}
                  </Link>
                  <span className="text-sm text-gray-400">{subtitle}</span>
                </div>
                
                {item.description && <div className="text-gray-600 mb-2 max-w-xl">{item.description}</div>}
                {item.excerpt && <div className="text-gray-600 mb-2 max-w-xl">{item.excerpt}</div>}
                
                <div className={`flex gap-2 text-sm ${tagColor}`}>
                   <span>#{item.type}</span>
                   {item.category && <span>#{item.category.toLowerCase()}</span>}
                </div>
              </div>
            );
          })}

        </div>
      </section>
    </div>
  );
}
