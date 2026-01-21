import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const patterns = [
  { re: /<<<<<<<|>>>>>>>|=======/g, label: 'merge conflict marker' },
  { re: /\bdebugger\b/g, label: 'debugger statement' },
];

let files = [];
try {
  const output = execSync('rg --files src public', { encoding: 'utf8' }).trim();
  files = output ? output.split('\n') : [];
} catch {
  files = [];
}

let failed = false;

files.forEach((file) => {
  const content = readFileSync(file, 'utf8');
  patterns.forEach(({ re, label }) => {
    if (re.test(content)) {
      console.error(`[lint] ${label} found in ${file}`);
      failed = true;
    }
  });
});

if (failed) {
  process.exit(1);
}
