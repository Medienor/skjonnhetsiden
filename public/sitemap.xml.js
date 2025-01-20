const isDev = true; // Change this to false when deploying
const domain = isDev ? 'http://localhost:3000' : 'https://xn--regnskapsfrerlisten-00b.no';

const municipalities = [
  'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen'
  // Add all your municipalities here
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${municipalities.map(city => `
  <url>
    <loc>${domain}/${city.toLowerCase()}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  `).join('')}
</urlset>`;

console.log(xml);
// Just copy-paste the output into public/sitemap.xml 