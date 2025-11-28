import { supabase } from '@/lib/supabase';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getCV() {
  const { data } = await supabase
    .from('cv')
    .select('data')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data ? data.data : null;
}

export default async function CVPage() {
  const cv = await getCV();

  if (!cv) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      
      {/* Header */}
      <header className="mb-12 border-b border-black pb-8">
        <h1 className="text-4xl font-bold mb-2">{cv.header.name}</h1>
        <p className="text-xl text-gray-600">{cv.header.role}</p>
      </header>

      {/* Summary */}
      <section className="mb-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Summary</h2>
        <p className="text-gray-800 leading-relaxed">
          {cv.summary}
        </p>
      </section>

      {/* Experience */}
      <section className="mb-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Experience</h2>
        
        {cv.experience.map((exp: any) => (
          <div key={exp.id} className="mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
              <h3 className="text-lg font-bold">{exp.role}</h3>
              <span className="text-gray-500 font-mono text-sm">{exp.period}</span>
            </div>
            <p className="text-gray-600 mb-3 italic">{exp.company}</p>
            <ul className="list-disc list-outside ml-4 text-gray-700 space-y-1">
              {exp.items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Skills</h2>
        <div className="flex flex-wrap gap-2 text-sm text-gray-700 font-mono">
          {cv.skills.map((skill: string, i: number) => (
            <span key={skill}>
              {skill}{i < cv.skills.length - 1 ? ',' : ''}
            </span>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Education</h2>
        {cv.education.map((edu: any) => (
          <div key={edu.id} className="mb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1">
              <h3 className="text-lg font-bold">{edu.degree}</h3>
              <span className="text-gray-500 font-mono text-sm">{edu.year}</span>
            </div>
            <p className="text-gray-600">{edu.school}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
