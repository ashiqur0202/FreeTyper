// Who gets a certificate, and the small text rules behind it. Pure: tested by scripts/test-certificate.mjs.

/** A speed test shorter than this is too noisy to certify. Our own suggestion. */
export const CERT_MIN_SECONDS = 30;
/** Same bar as the daily streak. Our own suggestion. */
export const CERT_MIN_ACCURACY = 90;
export const CERT_NAME_MAX = 40;

interface RunLike {
  mode: string;
  modeDetail?: string;
  duration: number;
  accuracy: number;
  wpm: number;
}

/**
 * Number row runs use the speed-test mode but are digits, not sentences, so they get no certificate. The label is
 * the one numberRow.ts gives them (isNumberRowDetail); it is repeated here so this file stays import-free for tests.
 */
export function canIssueCertificate(run: RunLike): boolean {
  if (run.modeDetail?.startsWith('number row')) return false;
  return run.mode === 'speed-test' && run.wpm > 0 && run.duration >= CERT_MIN_SECONDS && run.accuracy >= CERT_MIN_ACCURACY;
}

/** The name as printed: one line, no control characters, at most CERT_NAME_MAX long. Empty becomes "Typist". */
export function cleanCertificateName(raw: string): string {
  const name = raw
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, CERT_NAME_MAX)
    .trim();
  return name || 'Typist';
}

/** "60" -> "1-minute", "15" -> "15-second", "90" -> "1 min 30 s": reads as "in a ___ test". */
export function durationWords(seconds: number): string {
  if (seconds < 60) return `${seconds}-second`;
  if (seconds % 60 === 0) return `${seconds / 60}-minute`;
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

export function certificateFileName(name: string, wpm: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `freetyper-certificate-${slug ? `${slug}-` : ''}${wpm}wpm.png`;
}

/**
 * The script face carries Basic Latin and Latin-1 only (the "latin" font subset). Other alphabets fall back to a
 * device font, which is taller, so the picture starts those names smaller.
 */
export function usesScriptFont(name: string): boolean {
  return /^[ -ÿ]+$/.test(name);
}
