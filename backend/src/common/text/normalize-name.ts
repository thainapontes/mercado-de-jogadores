const CONTROL_CHARACTER = /\p{Cc}/u;
const EDGE_SPACES = /^ +| +$/g;
const REPEATED_SPACES = / {2,}/g;

export function hasControlCharacter(text: string): boolean {
  return CONTROL_CHARACTER.test(text);
}

export function normalizeName(text: string): string {
  return text.replace(EDGE_SPACES, '').replace(REPEATED_SPACES, ' ');
}
