import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scriptPath = join(__dirname, '../src/server/downloadRegistry.ts');

// Use tsx instead of ts-node
const tsxPath = join(__dirname, '../node_modules/.bin/tsx');

const child = spawn(tsxPath, [
  scriptPath
], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start script:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
}); 