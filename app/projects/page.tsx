import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Project {
  id: number; // Changed to number as per Supabase auto-increment
  title: string;
  description: string;
  year: string;
  tags: string[];
  category: 'Software' | 'Hardware';
  link?: string;
}

async function getProjects() {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function ProjectsPage() {
  const projects: Project[] = await getProjects();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-12">Projects</h1>

      <div className="space-y-12">
        {projects.length === 0 && (
          <p className="text-gray-500 italic">No projects found.</p>
        )}
        
        {projects.map((project) => (
          <div key={project.id} className="group">
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
              <h2 className="text-2xl font-bold group-hover:text-accent-2 transition-colors">
                {project.link && project.link !== '#' ? (
                  <a href={project.link} target="_blank" rel="noopener noreferrer">{project.title}</a>
                ) : (
                  project.title
                )}
              </h2>
              <span className="text-sm text-gray-400">[{project.year}]</span>
            </div>
            
            <p className="text-gray-700 max-w-2xl mb-3 leading-relaxed">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {project.tags.map((tag) => (
                <span key={tag} className="text-gray-500 italic">
                  #{tag.toLowerCase().replace(' ', '-')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
