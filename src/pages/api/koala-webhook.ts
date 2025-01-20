import { supabase } from '@/utils/supabase';
import type { Request, Response } from 'express';

// Internal slugify function
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default async function handler(req: Request, res: Response) {
  console.log('Webhook received:', {
    method: req.method,
    body: req.body
  });

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { output, config } = req.body;
    
    console.log('Webhook payload:', {
      output: output ? 'exists' : 'missing',
      html: output?.html ? `${output.html.substring(0, 100)}...` : 'missing',
      keyword: config?.targetKeyword || 'missing',
      images: output?.images || 'no images'
    });
    
    // Function to extract image URL from HTML content
    const extractImageUrl = (html: string): string | null => {
      const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
      return imgMatch ? imgMatch[1] : null;
    };

    if (!output?.html || !config?.targetKeyword) {
      console.log('Invalid payload - missing required fields');
      return res.status(400).json({ message: 'Invalid payload' });
    }

    // Create URL-friendly slug from the keyword
    const slug = slugify(config.targetKeyword);
    console.log('Generated slug:', slug);
    
    // Extract image URL from HTML content
    const imageUrl = extractImageUrl(output.html);
    console.log('Extracted image URL:', imageUrl);

    // Store the guide in Supabase
    console.log('Attempting Supabase insertion...');
    const { data, error } = await supabase
      .from('guides')
      .insert([
        {
          title: config.targetKeyword,
          content: output.html,
          slug: slug,
          created_at: new Date().toISOString(),
          image_url: imageUrl
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Guide created successfully:', {
      slug,
      id: data?.id,
      hasImage: !!imageUrl
    });

    return res.status(200).json({ message: 'Guide created successfully', slug });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
} 