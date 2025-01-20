import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to normalize municipality names exactly like the frontend
function normalizeMunicipalityName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '---')   // Replace spaces with triple hyphens
    .replace(/æ/g, 'ae')      // Replace æ with ae
    .replace(/ø/g, 'o')       // Replace ø with o
    .replace(/å/g, 'a')       // Replace å with a
    .replace(/[^a-z0-9-]/g, '---') // Replace special chars with triple hyphens
    .replace(/---+/g, '---')  // Replace multiple triple hyphens with single triple hyphen
    .replace(/^---+|---+$/g, ''); // Remove leading/trailing triple hyphens
}

// Function to normalize company names (similar to your frontend)
function normalizeCompanyName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Read municipalities and companies
const municipalitiesJson = JSON.parse(
  readFileSync(join(__dirname, '../src/data/municipalities.json'), 'utf8')
);
const companyJson = JSON.parse(
  readFileSync(join(__dirname, '../src/data/company.json'), 'utf8')
);

// Filter accounting companies (assuming you have a way to identify them)
const accountingCompanies = companyJson.filter(company => 
  company.naeringskode1?.kode === "69.201"
);

// Add Supabase client initialization with loaded env variables
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Fetch questions from Supabase guides table
const { data: guides } = await supabase
  .from('guides')
  .select('title, slug')
  .order('created_at', { ascending: false });

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:8087/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${municipalitiesJson.map(municipality => `
  <url>
    <loc>http://localhost:8087/${normalizeMunicipalityName(municipality.name)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  `).join('')}
  ${accountingCompanies.map(company => `
  <url>
    <loc>http://localhost:8087/regnskapsforer/${normalizeCompanyName(company.navn)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
  ${guides.map(guide => `
  <url>
    <loc>http://localhost:8087/sporsmal/${guide.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  `).join('')}
</urlset>`;

// Write to public/sitemap.xml
writeFileSync('public/sitemap.xml', xml);
console.log('Sitemap generated at public/sitemap.xml'); 