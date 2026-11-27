// Lets node --experimental-strip-types follow extensionless relative imports (./typingData) to their .ts files,
// and the `@/` alias (src/) used by the app code.
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) return resolve(pathToFileURL(path.join(SRC, specifier.slice(2))).href, context, nextResolve);
  try {
    return await nextResolve(specifier, context);
  } catch (e) {
    const local = specifier.startsWith('.') || specifier.startsWith('file:');
    if (e.code === 'ERR_MODULE_NOT_FOUND' && local) return nextResolve(`${specifier}.ts`, context);
    // A folder import: ./library means ./library.ts when that exists (like TypeScript), else ./library/index.ts
    if (e.code === 'ERR_UNSUPPORTED_DIR_IMPORT' && local) {
      const base = specifier.replace(/\/$/, '');
      try {
        return await nextResolve(`${base}.ts`, context);
      } catch {
        return nextResolve(`${base}/index.ts`, context);
      }
    }
    throw e;
  }
}
