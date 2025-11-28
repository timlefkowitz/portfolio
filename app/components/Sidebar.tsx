'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-main-bg border-b border-accent-2/20 z-50 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl tracking-tight hover:text-accent-5 transition-colors">
          Tim Lefkowitz
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-2xl focus:outline-none w-8 h-8 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-screen w-full md:w-64 bg-main-bg 
        border-r border-accent-2/20 z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 pt-20' : '-translate-x-full md:translate-x-0'}
        md:pt-0
        flex flex-col
      `}>
        <div className="p-6 md:p-12 flex flex-col h-full gap-8 overflow-y-auto">
            {/* Desktop Logo Area */}
            <div className="hidden md:block">
                <Link href="/" className="font-bold text-2xl tracking-tight hover:text-accent-5 transition-colors">
                Tim Lefkowitz
                </Link>
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                Programmer<br/>
                Photographyer<br/>
                Retro Game Collector<br/>
                Synth Maker
                </p>
            </div>

            {/* Mobile Intro (optional) */}
            <div className="md:hidden">
                 <p className="text-sm text-gray-600 leading-relaxed">
                programmer / retro game collector / synth maker
                </p>
            </div>

            <nav className="flex flex-col gap-6 md:gap-3 mt-4 md:mt-0">
                <Link href="/projects" onClick={() => setIsOpen(false)} className="text-2xl md:text-lg hover:text-accent-2 transition-colors font-bold md:font-normal">
                projects
                </Link>
                <Link href="/blog" onClick={() => setIsOpen(false)} className="text-2xl md:text-lg hover:text-accent-1 transition-colors font-bold md:font-normal">
                blog
                </Link>
                <Link href="/gallery" onClick={() => setIsOpen(false)} className="text-2xl md:text-lg hover:text-accent-3 transition-colors font-bold md:font-normal">
                gallery
                </Link>
        <Link href="/cv" onClick={() => setIsOpen(false)} className="text-2xl md:text-lg hover:text-accent-4 transition-colors font-bold md:font-normal">
          cv
        </Link>
        <Link href="/admin" onClick={() => setIsOpen(false)} className="text-sm md:text-xs text-gray-300 hover:text-gray-500 transition-colors mt-4">
          [admin]
        </Link>
      </nav>

            <div className="mt-auto text-xs text-gray-400">
                <div className="flex flex-wrap gap-2 mb-4">
                <span className="hover:text-accent-5 cursor-default">#typescript</span>
                <span className="hover:text-accent-5 cursor-default">#synthesis</span>
                <span className="hover:text-accent-5 cursor-default">#retro</span>
                </div>
                © {new Date().getFullYear()}
            </div>
        </div>
      </aside>
      
      {/* Overlay backdrop for mobile */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
