import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

export async function POST() {
  const logs: string[] = [];
  const log = (msg: string) => logs.push(msg);

  try {
    // 1. Migrate Posts
    const postsPath = path.join(process.cwd(), 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
      log(`Found ${posts.length} posts.`);
      
      for (const post of posts) {
        // Remove ID to let Supabase generate it, or keep it if we want to preserve legacy IDs (but Supabase uses int8 usually)
        // Our schema uses bigint generated always as identity. We should let Supabase generate IDs.
        const { id, ...postData } = post;
        const { error } = await supabase.from('posts').insert(postData);
        if (error) log(`Error inserting post "${post.title}": ${error.message}`);
      }
      log('Posts migration finished.');
    } else {
      log('No posts.json found.');
    }

    // 2. Migrate Projects
    const projectsPath = path.join(process.cwd(), 'data', 'projects.json');
    if (fs.existsSync(projectsPath)) {
      const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
      log(`Found ${projects.length} projects.`);
      
      let order = 0;
      for (const proj of projects) {
        const { id, ...projData } = proj;
        const { error } = await supabase.from('projects').insert({ ...projData, display_order: order++ });
        if (error) log(`Error inserting project "${proj.title}": ${error.message}`);
      }
      log('Projects migration finished.');
    } else {
        log('No projects.json found.');
    }

    // 3. Migrate Gallery
    const galleryPath = path.join(process.cwd(), 'data', 'gallery.json');
    if (fs.existsSync(galleryPath)) {
      const galleries = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
      log(`Found ${galleries.length} galleries.`);
      
      for (const gal of galleries) {
        const { id, ...galData } = gal;
        // Ensure images is an array
        const images = Array.isArray(gal.images) ? gal.images : [];
        const { error } = await supabase.from('galleries').insert({ ...galData, images });
        if (error) log(`Error inserting gallery "${gal.title}": ${error.message}`);
      }
      log('Gallery migration finished.');
    } else {
        log('No gallery.json found.');
    }

    // 4. Migrate CV
    const cvPath = path.join(process.cwd(), 'data', 'cv.json');
    if (fs.existsSync(cvPath)) {
      const cvData = JSON.parse(fs.readFileSync(cvPath, 'utf8'));
      log('Found CV data.');
      const { error } = await supabase.from('cv').insert({ data: cvData });
      if (error) log(`Error inserting CV: ${error.message}`);
      else log('CV migration finished.');
    } else {
        log('No cv.json found.');
    }

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, logs });
  }
}

