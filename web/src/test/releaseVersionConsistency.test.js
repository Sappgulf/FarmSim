import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { APP_VERSION } from '../config/release';
import APP_RELEASE_INFO from '../config/version.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Release surface consistency', () => {
  it('keeps APP_VERSION aligned with package and service worker cache naming', () => {
    const packagePath = path.join(__dirname, '../..', 'package.json');
    const versionPath = path.join(__dirname, '../config/version.json');
    const swPath = path.join(__dirname, '../../public/sw.js');
    const menuDrawerPath = path.join(__dirname, '../../components/MenuDrawer.jsx');
    const iosProjectPath = path.join(__dirname, '../../ios/project.yml');
    const iosInfoPlistPath = path.join(__dirname, '../../ios/App/Info.plist');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const versionJson = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    const swSource = fs.readFileSync(swPath, 'utf8');
    const menuDrawerSource = fs.readFileSync(menuDrawerPath, 'utf8');
    const iosProjectSource = fs.readFileSync(iosProjectPath, 'utf8');
    const iosInfoPlistSource = fs.readFileSync(iosInfoPlistPath, 'utf8');

    const cacheMatch = swSource.match(/const CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);

    expect(versionJson.version).toBe(APP_RELEASE_INFO.version);
    expect(packageJson.version).toBe(APP_VERSION);
    expect(versionJson.version).toBe(packageJson.version);
    expect(cacheMatch, 'sw.js must expose CACHE_NAME').not.toBeNull();
    expect(cacheMatch[1]).toBe(`farmsim-v${APP_VERSION}`);
    expect(menuDrawerSource).toContain('Version ${APP_VERSION}');
    expect(menuDrawerSource).not.toMatch(/Version\s+5\.5\.4|Version\s+5\.0\.0/);

    const iosMatch = iosProjectSource.match(/MARKETING_VERSION:\s*(?:"([^"]+)"|'([^']+)'|([^\n#]+))/);
    expect(iosMatch, 'ios project should declare MARKETING_VERSION').not.toBeNull();
    const iosVersion = iosMatch ? (iosMatch[1] || iosMatch[2] || iosMatch[3]).trim() : '';
    expect(iosVersion).toBe(APP_VERSION);
    expect(iosInfoPlistSource).toContain('$(MARKETING_VERSION)');
  });
});
