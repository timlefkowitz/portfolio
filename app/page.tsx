import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
          hi, i'm tim.
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
          I explore the intersection of <span className="text-black font-medium">software</span> and <span className="text-black font-medium">sound</span>. 
          I build digital tools, restore vintage hardware, and design electronic instruments.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Recent Work</h2>
        <div className="space-y-8">
          
          <div className="group">
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
              <Link href="/projects" className="text-2xl font-bold hover:text-accent-2 transition-colors">
                E-Commerce Platform
              </Link>
              <span className="text-sm text-gray-400">[2025]</span>
            </div>
            <div className="text-gray-600 mb-2 max-w-xl">
              Full-stack solution with Next.js and Stripe.
            </div>
            <div className="flex gap-2 text-sm text-accent-5">
              <span>#software</span>
              <span>#react</span>
            </div>
          </div>

          <div className="group">
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
              <Link href="/projects" className="text-2xl font-bold hover:text-accent-3 transition-colors">
                Analog Drone Synth
              </Link>
              <span className="text-sm text-gray-400">[2024]</span>
            </div>
            <div className="text-gray-600 mb-2 max-w-xl">
              Custom 3-oscillator drone synthesizer.
            </div>
            <div className="flex gap-2 text-sm text-accent-3">
              <span>#hardware</span>
              <span>#synthesis</span>
            </div>
          </div>

           <div className="group">
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
              <Link href="/blog/1" className="text-2xl font-bold hover:text-accent-1 transition-colors">
                Welcome to my new portfolio
              </Link>
              <span className="text-sm text-gray-400">[blog]</span>
            </div>
            <div className="text-gray-600 mb-2 max-w-xl">
              Thoughts on the new site architecture.
            </div>
            <div className="flex gap-2 text-sm text-accent-1">
               <span>#update</span>
            </div>
          </div>

        </div>
        
        <div className="mt-12">
          <Link href="/projects" className="inline-block border-b border-black pb-1 hover:text-gray-600 transition-colors">
            view all projects →
          </Link>
        </div>
      </section>
    </div>
  );
}
