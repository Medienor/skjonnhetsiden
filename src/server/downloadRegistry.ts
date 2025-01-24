import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable, Transform } from 'stream';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = path.join(__dirname, '../../data/registry');

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.promises.access(dir);
  } catch {
    await fs.promises.mkdir(dir, { recursive: true });
  }
}

async function downloadAndExtractZip(url: string, filename: string) {
  console.log(`Downloading ${filename}...`);
  
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to download ${filename}: ${response.status}\nResponse: ${text}`);
  }

  if (!response.body) {
    throw new Error(`No response body received for ${filename}`);
  }

  // First save the zip file
  const zipPath = path.join(DOWNLOAD_DIR, `${filename}.zip`);
  const fileStream = createWriteStream(zipPath);
  await pipeline(Readable.from(response.body), fileStream);

  // Then extract it
  console.log('Extracting ZIP file...');
  const zip = new AdmZip(zipPath);
  
  // Log what's in the ZIP
  const entries = zip.getEntries();
  console.log('Files in ZIP:', entries.map(e => e.entryName));

  // Find any file in the ZIP (not just .json)
  const entry = entries[0];
  if (!entry) {
    throw new Error('ZIP file is empty');
  }

  // Extract and save the first file with the desired name
  const outputPath = path.join(DOWNLOAD_DIR, filename);
  zip.extractEntryTo(entry, DOWNLOAD_DIR, false, true);

  // Delete the ZIP file
  await fs.promises.unlink(zipPath);

  console.log(`Successfully extracted ${filename}`);
  return outputPath;
}

async function downloadRegistry() {
  try {
    await ensureDirectoryExists(DOWNLOAD_DIR);
    const timestamp = new Date().toISOString().split('T')[0];

    // Download and extract companies data
    await downloadAndExtractZip(
      'https://data.brreg.no/enhetsregisteret/api/enheter/lastned/regneark',
      `companies_${timestamp}.json`
    );

    // Download and extract roles data
    await downloadAndExtractZip(
      'https://data.brreg.no/enhetsregisteret/api/roller/totalbestand',
      `roles_${timestamp}.json`
    );

    console.log('Registry download completed successfully!');
  } catch (error) {
    console.error('Error downloading registry:', error);
    process.exit(1);
  }
}

// Run the download
downloadRegistry(); 