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
    if (e.code === 'ERR_MODULE_NOT_FOUND' && (specifier.startsWith('.') || specifier.startsWith('file:'))) return nextResolve(`${specifier}.ts`, context);
    throw e;
  }
}
