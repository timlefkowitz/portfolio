'use client';

import { useState, useEffect, useRef } from 'react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'blog' | 'projects' | 'gallery' | 'cv'>('blog');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [editMode, setEditMode] = useState<string | null>(null); // ID of item being edited

  // Data Lists
  const [posts, setPosts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [cvData, setCvData] = useState<any>(null);

  // Form States
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState<File | null>(null);
  const blogContentRef = useRef<HTMLTextAreaElement>(null);

  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projYear, setProjYear] = useState('');
  const [projTags, setProjTags] = useState('');
  const [projCategory, setProjCategory] = useState<'Software' | 'Hardware'>('Software');
  const [projLink, setProjLink] = useState('');

  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryColor, setGalleryColor] = useState('bg-accent-1');
  const [galleryThumbnail, setGalleryThumbnail] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<FileList | null>(null);
  const [currentGalleryImages, setCurrentGalleryImages] = useState<string[]>([]);

  // Fetch Data on Tab Change
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'blog') {
      fetch('/api/posts').then(res => res.json()).then(setPosts);
    } else if (activeTab === 'projects') {
      fetch('/api/projects').then(res => res.json()).then(setProjects);
    } else if (activeTab === 'gallery') {
      fetch('/api/gallery').then(res => res.json()).then(setGalleries);
    } else if (activeTab === 'cv') {
      fetch('/api/cv').then(res => res.json()).then(setCvData);
    }
  }, [isAuthenticated, activeTab, status]); // Refresh on status change (after update)

  const resetForms = () => {
    setEditMode(null);
    setBlogTitle(''); setBlogContent(''); setBlogImage(null);
    setProjTitle(''); setProjDesc(''); setProjYear(''); setProjTags(''); setProjLink('');
    setGalleryTitle(''); setGalleryThumbnail(null); setGalleryImages(null); setCurrentGalleryImages([]);
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!blogContentRef.current) return;
    const textarea = blogContentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selection + suffix + after;
    setBlogContent(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleEditPost = (post: any) => {
    setEditMode(post.id);
    setBlogTitle(post.title);
    setBlogContent(post.content);
  };

  const handleEditProject = (project: any) => {
    setEditMode(project.id);
    setProjTitle(project.title);
    setProjDesc(project.description);
    setProjYear(project.year);
    setProjTags(project.tags.join(', '));
    setProjCategory(project.category);
    setProjLink(project.link);
  };

  const handleEditGallery = (gallery: any) => {
    setEditMode(gallery.id);
    setGalleryTitle(gallery.title);
    setGalleryColor(gallery.color);
    setCurrentGalleryImages(gallery.images || []);
    // We don't set files directly, user has to re-upload if they want to change/add
  };

  const handleDelete = async (type: 'posts' | 'projects' | 'gallery', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await fetch(`/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'DELETE', id }),
      });
      setStatus('success');
    } catch { setStatus('error'); }
    setTimeout(() => setStatus('idle'), 2000);
  };

  const moveProject = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === projects.length - 1) return;

    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
    
    // Optimistic UI update
    setProjects(newProjects);

    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'REORDER', data: newProjects }),
      });
      // No need to set success status here to avoid full refresh flicker, just silent save
    } catch { 
      setStatus('error'); 
      // Revert on error could be implemented here
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthenticated(true);
    else alert('Incorrect password');
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      let imageUrl = '';
      if (blogImage) {
        const formData = new FormData();
        formData.append('file', blogImage);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          imageUrl = data.url;
        }
      }

      const blogData: any = { title: blogTitle, content: blogContent };
      if (imageUrl) blogData.image = imageUrl;

      const body = editMode 
        ? { method: 'PUT', id: editMode, data: blogData }
        : blogData;
      
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setStatus('success');
      resetForms();
    } catch { setStatus('error'); }
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const projectData = {
        title: projTitle,
        description: projDesc,
        year: projYear,
        tags: projTags.split(',').map(t => t.trim()),
        category: projCategory,
        link: projLink
      };

      const body = editMode 
        ? { method: 'PUT', id: editMode, data: projectData }
        : projectData;

      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setStatus('success');
      resetForms();
    } catch { setStatus('error'); }
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // 1. Upload Thumbnail
      let thumbnailUrl = '';
      if (galleryThumbnail) {
        const formData = new FormData();
        formData.append('file', galleryThumbnail);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          thumbnailUrl = data.url;
        }
      }

      // 2. Upload Multiple Images
      const newImageUrls: string[] = [];
      if (galleryImages) {
        for (let i = 0; i < galleryImages.length; i++) {
          const file = galleryImages[i];
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            newImageUrls.push(data.url);
          }
        }
      }

      // 3. Construct Data
      const galleryData: any = { 
        title: galleryTitle, 
        color: galleryColor,
        images: [...(editMode ? currentGalleryImages : []), ...newImageUrls] // Append new images
      };
      
      if (thumbnailUrl) galleryData.thumbnail = thumbnailUrl;

      const body = editMode 
        ? { method: 'PUT', id: editMode, data: galleryData }
        : { ...galleryData }; // POST handles ID creation

      await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setStatus('success');
      resetForms();
    } catch { setStatus('error'); }
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleCvUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cvData),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch { setStatus('error'); }
    setTimeout(() => setStatus('idle'), 3000);
  };


  if (!isAuthenticated) {
      return (
      <div className="max-w-md mt-12">
        <h1 className="text-3xl font-bold mb-8">Admin Access</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full p-2 border-b-2 border-gray-200 focus:border-accent-5 outline-none bg-transparent font-mono"
          />
          <button type="submit" className="bg-black text-white px-6 py-2 font-bold hover:bg-gray-800 transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Content Management</h1>
      
      <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4 overflow-x-auto items-center">
        {['blog', 'projects', 'gallery', 'cv'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab as any); resetForms(); }}
            className={`uppercase font-bold text-sm tracking-widest px-2 py-1 ${
              activeTab === tab ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="ml-auto">
           <a href="/admin/migrate" className="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-widest">
              ⚠ Migrate Data
           </a>
        </div>
      </div>

      {status === 'success' && <div className="text-green-600 mb-6 font-mono text-sm bg-green-50 p-2 rounded">&gt; Success!</div>}
      {status === 'error' && <div className="text-red-600 mb-6 font-mono text-sm bg-red-50 p-2 rounded">&gt; Error!</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LIST SIDEBAR */}
        <div className="lg:col-span-1 border-r border-gray-100 pr-6 overflow-y-auto max-h-[600px]">
            <h3 className="font-bold uppercase text-xs text-gray-400 mb-4">Existing Items</h3>
            
            {activeTab === 'blog' && posts.map((post) => (
                <div key={post.id} className="mb-3 p-2 hover:bg-gray-50 rounded group flex justify-between items-center">
                    <div onClick={() => handleEditPost(post)} className="cursor-pointer truncate text-sm font-bold w-full">
                        {post.title}
                    </div>
                    <button onClick={() => handleDelete('posts', post.id)} className="text-red-400 hover:text-red-600 text-xs px-2">x</button>
                </div>
            ))}

            {activeTab === 'projects' && projects.map((proj, index) => (
                <div key={proj.id} className="mb-3 p-2 hover:bg-gray-50 rounded group flex justify-between items-center">
                    <div className="flex flex-col mr-2 gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveProject(index, 'up'); }} 
                          className="text-[10px] text-gray-400 hover:text-black leading-none disabled:opacity-30"
                          disabled={index === 0}
                        >
                          ▲
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveProject(index, 'down'); }} 
                          className="text-[10px] text-gray-400 hover:text-black leading-none disabled:opacity-30"
                          disabled={index === projects.length - 1}
                        >
                          ▼
                        </button>
                    </div>
                    <div onClick={() => handleEditProject(proj)} className="cursor-pointer truncate text-sm font-bold w-full">
                        {proj.title}
                    </div>
                    <button onClick={() => handleDelete('projects', proj.id)} className="text-red-400 hover:text-red-600 text-xs px-2">x</button>
                </div>
            ))}

             {activeTab === 'gallery' && galleries.map((gallery) => (
                <div key={gallery.id} className="mb-3 p-2 hover:bg-gray-50 rounded group flex justify-between items-center">
                    <div onClick={() => handleEditGallery(gallery)} className="cursor-pointer truncate text-sm font-bold w-full">
                        {gallery.title}
                    </div>
                    <button onClick={() => handleDelete('gallery', gallery.id)} className="text-red-400 hover:text-red-600 text-xs px-2">x</button>
                </div>
            ))}

            {activeTab === 'cv' && <div className="text-sm text-gray-400 italic">Use the editor to modify CV JSON directly.</div>}
            
            {activeTab !== 'cv' && (
                <button onClick={resetForms} className="mt-4 w-full text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded font-bold text-gray-600">
                    + Create New
                </button>
            )}
        </div>

        {/* FORM AREA */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">
                {editMode ? `Edit ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : `New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            </h2>

            {activeTab === 'blog' && (
                <form onSubmit={handleBlogSubmit} className="space-y-6">
                <input type="text" placeholder="Title" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} className="w-full p-2 border-b border-gray-200 focus:border-accent-1 outline-none bg-transparent font-bold" required />
                
                <div className="flex gap-2 mb-2 bg-gray-50 p-2 rounded text-sm">
                  <button type="button" onClick={() => insertMarkdown('**', '**')} className="px-2 hover:bg-gray-200 rounded font-bold" title="Bold">B</button>
                  <button type="button" onClick={() => insertMarkdown('*', '*')} className="px-2 hover:bg-gray-200 rounded italic" title="Italic">I</button>
                  <button type="button" onClick={() => insertMarkdown('# ')} className="px-2 hover:bg-gray-200 rounded font-bold" title="Heading 1">H1</button>
                  <button type="button" onClick={() => insertMarkdown('## ')} className="px-2 hover:bg-gray-200 rounded font-bold" title="Heading 2">H2</button>
                  <button type="button" onClick={() => insertMarkdown('`', '`')} className="px-2 hover:bg-gray-200 rounded font-mono" title="Code">{'<>'}</button>
                  <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} className="px-2 hover:bg-gray-200 rounded font-mono" title="Code Block">{'```'}</button>
                  <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="px-2 hover:bg-gray-200 rounded text-blue-500" title="Link">Link</button>
                  <button type="button" onClick={() => insertMarkdown('- ')} className="px-2 hover:bg-gray-200 rounded" title="List">• List</button>
                </div>

                <textarea 
                  ref={blogContentRef}
                  placeholder="Content (Markdown supported)..." 
                  value={blogContent} 
                  onChange={(e) => setBlogContent(e.target.value)} 
                  rows={15} 
                  className="w-full p-4 border border-gray-200 rounded focus:border-accent-1 outline-none bg-transparent font-mono text-sm" 
                  required 
                />
                
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-400">Featured Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setBlogImage(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
                </div>

                <button type="submit" disabled={status === 'loading'} className="bg-black text-white px-6 py-2 font-bold hover:bg-gray-800">{editMode ? 'Update Post' : 'Publish Post'}</button>
                </form>
            )}

            {activeTab === 'projects' && (
                <form onSubmit={handleProjectSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Title" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} className="w-full p-2 border-b border-gray-200 focus:border-accent-2 outline-none bg-transparent font-bold" required />
                    <input type="text" placeholder="Year" value={projYear} onChange={(e) => setProjYear(e.target.value)} className="w-full p-2 border-b border-gray-200 focus:border-accent-2 outline-none bg-transparent" />
                </div>
                <textarea placeholder="Description" value={projDesc} onChange={(e) => setProjDesc(e.target.value)} rows={4} className="w-full p-2 border border-gray-200 rounded focus:border-accent-2 outline-none bg-transparent font-mono text-sm" required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Tags (comma separated)" value={projTags} onChange={(e) => setProjTags(e.target.value)} className="w-full p-2 border-b border-gray-200 focus:border-accent-2 outline-none bg-transparent" />
                    <select value={projCategory} onChange={(e) => setProjCategory(e.target.value as any)} className="w-full p-2 border-b border-gray-200 focus:border-accent-2 outline-none bg-transparent">
                        <option value="Software">Software</option>
                        <option value="Hardware">Hardware</option>
                    </select>
                </div>
                <input type="text" placeholder="Link URL (optional)" value={projLink} onChange={(e) => setProjLink(e.target.value)} className="w-full p-2 border-b border-gray-200 focus:border-accent-2 outline-none bg-transparent" />
                <button type="submit" disabled={status === 'loading'} className="bg-black text-white px-6 py-2 font-bold hover:bg-gray-800">{editMode ? 'Update Project' : 'Add Project'}</button>
                </form>
            )}

            {activeTab === 'gallery' && (
                <form onSubmit={handleGallerySubmit} className="space-y-6">
                <input type="text" placeholder="Gallery Title" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} className="w-full p-2 border-b border-gray-200 focus:border-accent-3 outline-none bg-transparent font-bold" required />
                
                <div className="flex gap-2">
                    {['bg-accent-1', 'bg-accent-2', 'bg-accent-3', 'bg-accent-4', 'bg-accent-5', 'bg-accent-6'].map(c => (
                        <button key={c} type="button" onClick={() => setGalleryColor(c)} className={`w-8 h-8 rounded-full ${c} ${galleryColor === c ? 'ring-2 ring-black ring-offset-2' : ''}`} />
                    ))}
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-400">Cover/Thumbnail</label>
                    <input type="file" accept="image/*" onChange={(e) => setGalleryThumbnail(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-400">Add Images (Multiple)</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => setGalleryImages(e.target.files)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
                </div>

                {editMode && currentGalleryImages.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded">
                        <h4 className="text-xs font-bold mb-2 text-gray-500">Current Images ({currentGalleryImages.length})</h4>
                         <div className="flex flex-wrap gap-2">
                            {currentGalleryImages.map((img, i) => (
                                <img key={i} src={img} className="w-16 h-16 object-cover rounded border border-gray-200" />
                            ))}
                         </div>
                    </div>
                )}

                <button type="submit" disabled={status === 'loading'} className="bg-black text-white px-6 py-2 font-bold hover:bg-gray-800">{editMode ? 'Update Gallery' : 'Create Gallery'}</button>
                </form>
            )}

             {activeTab === 'cv' && cvData && (
                <form onSubmit={handleCvUpdate} className="space-y-6">
                <textarea
                    value={JSON.stringify(cvData, null, 2)}
                    onChange={(e) => { try { setCvData(JSON.parse(e.target.value)); } catch (err) {} }}
                    rows={20}
                    className="w-full p-4 border border-gray-200 rounded focus:border-accent-4 outline-none bg-gray-50 font-mono text-xs"
                />
                <button type="submit" disabled={status === 'loading'} className="bg-black text-white px-6 py-2 font-bold hover:bg-gray-800">Save CV</button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}
