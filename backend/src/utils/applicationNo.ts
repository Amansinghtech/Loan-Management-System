import crypto from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)

/** Human-readable application reference, e.g. "LF-7Q3K9X2". */
export function generateApplicationNo(): string {
  const bytes = crypto.randomBytes(7);
  let code = '';
  for (let i = 0; i < 7; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `LF-${code}`;
}
