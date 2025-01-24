import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { createGunzip } from 'zlib';
import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Transform } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_DIR = path.join(__dirname, '../../data/registry');
const DB_PATH = path.join(__dirname, '../../data/registry.db');

async function initializeDatabase() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      organizationNumber TEXT PRIMARY KEY,
      name TEXT,
      organizationType TEXT,
      data JSON
    );

    CREATE TABLE IF NOT EXISTS roles (
      organizationNumber TEXT,
      roleType TEXT,
      personName TEXT,
      data JSON,
      PRIMARY KEY (organizationNumber, roleType, personName)
    );

    CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
    CREATE INDEX IF NOT EXISTS idx_roles_person ON roles(personName);
  `);

  return db;
}

async function processJsonFile(filePath: string) {
  const data = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function loadDatabase() {
  const db = await initializeDatabase();
  
  const files = await fs.promises.readdir(REGISTRY_DIR);
  const companiesFile = files.find(f => f.includes('companies') && f.endsWith('.json'));
  const rolesFile = files.find(f => f.includes('roles') && f.endsWith('.json'));

  console.log('Found files:', files);
  
  if (!companiesFile) {
    throw new Error('Companies file not found in ' + REGISTRY_DIR);
  }
  if (!rolesFile) {
    throw new Error('Roles file not found in ' + REGISTRY_DIR);
  }

  console.log('Loading companies...');
  const companiesData = await processJsonFile(path.join(REGISTRY_DIR, companiesFile));
  
  if (Array.isArray(companiesData)) {
    console.log(`Processing ${companiesData.length} companies...`);
    for (const company of companiesData) {
      await db.run(
        'INSERT OR REPLACE INTO companies (organizationNumber, name, organizationType, data) VALUES (?, ?, ?, ?)',
        [
          company.organisasjonsnummer,
          company.navn,
          company.organisasjonsform?.kode,
          JSON.stringify(company)
        ]
      );
    }
  }

  console.log('Loading roles...');
  const rolesData = await processJsonFile(path.join(REGISTRY_DIR, rolesFile));
  
  if (Array.isArray(rolesData)) {
    console.log(`Processing ${rolesData.length} roles...`);
    for (const role of rolesData) {
      await db.run(
        'INSERT OR REPLACE INTO roles (organizationNumber, roleType, personName, data) VALUES (?, ?, ?, ?)',
        [
          role.organisasjonsnummer,
          role.type,
          role.person?.navn,
          JSON.stringify(role)
        ]
      );
    }
  }

  console.log('Database loading complete!');
}

loadDatabase().catch(console.error); 