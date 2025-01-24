import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = path.join(__dirname, '../../data/registry');

async function ensureDirectoryExists(dir: string) {
  try {
    await fsPromises.access(dir);
  } catch {
    await fsPromises.mkdir(dir, { recursive: true });
  }
}

async function downloadFile(url: string, filename: string) {
  console.log(`Downloading ${filename}...`);
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.brreg.enhetsregisteret.enhet.v2+json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${filename}: ${response.status}`);
  }

  if (!response.body) {
    throw new Error(`No response body received for ${filename}`);
  }

  const filePath = path.join(DOWNLOAD_DIR, filename);
  const fileStream = fs.createWriteStream(filePath);
  const responseStream = Readable.from(response.body);

  if (filename.endsWith('.gz')) {
    // For gzipped files, decompress while downloading
    const gunzip = createGunzip();
    await pipeline(responseStream, gunzip, fileStream);
  } else {
    await pipeline(responseStream, fileStream);
  }

  console.log(`Successfully downloaded ${filename}`);
  return filePath;
}

async function downloadRegistry() {
  try {
    // Ensure download directory exists
    await ensureDirectoryExists(DOWNLOAD_DIR);

    const timestamp = new Date().toISOString().split('T')[0];

    // Download companies data
    await downloadFile(
      'https://data.brreg.no/enhetsregisteret/api/enheter/lastned',
      `companies_${timestamp}.json`
    );

    // Download roles data
    await downloadFile(
      'https://data.brreg.no/enhetsregisteret/api/roller/totalbestand',
      `roles_${timestamp}.json.gz`
    );

    console.log('Registry download completed successfully!');
  } catch (error) {
    console.error('Error downloading registry:', error);
    process.exit(1);
  }
}

// Run the download
downloadRegistry(); 