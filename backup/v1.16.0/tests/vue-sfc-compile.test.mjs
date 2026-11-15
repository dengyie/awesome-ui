import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';

const here = dirname(fileURLToPath(import.meta.url));
const vueDir = join(here, '..', 'vue');
const files = readdirSync(vueDir).filter((name) => name.endsWith('.vue'));

test('Vue SFC — every component compiles (script setup + template)', () => {
  assert.ok(files.length > 30, `expected all components, found ${files.length}`);

  const failures = [];
  for (const file of files) {
    const source = readFileSync(join(vueDir, file), 'utf8');
    const id = file.replace(/\.vue$/, '');
    try {
      const { descriptor, errors } = parse(source, { filename: file });
      if (errors.length) throw new Error(errors.map((e) => e.message).join('; '));

      if (descriptor.scriptSetup || descriptor.script) {
        compileScript(descriptor, { id });
      }

      if (descriptor.template) {
        const { errors: templateErrors } = compileTemplate({
          id,
          filename: file,
          source: descriptor.template.content,
          slotted: descriptor.slotted,
        });
        if (templateErrors.length) {
          throw new Error(templateErrors.map((e) => e.message || String(e)).join('; '));
        }
      }
    } catch (error) {
      failures.push(`${file}: ${error.message}`);
    }
  }

  assert.deepEqual(failures, [], `SFC compile failures:\n${failures.join('\n')}`);
});
