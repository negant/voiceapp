#!/usr/bin/env node
/**
 * Require android/keystore.properties before Play release AAB.
 */
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const props = resolve(root, 'android/keystore.properties');
const store = resolve(root, 'android/app/voiceapp-upload.keystore');

if (!existsSync(props) || !existsSync(store)) {
  console.error(
    'Missing release keystore. Run: npm run android:keystore\n' +
      'Then: npm run android:bundle:release',
  );
  process.exit(1);
}

console.log('Release keystore OK');
