const URL_RE = /https?:\/\/\S+/gi;
const TAG_RE = /[<>]/g;

export function sanitizeCustomText(raw: string): string {
  return raw
    .slice(0, 100)
    .replace(URL_RE, '')
    .replace(TAG_RE, '')
    .trim();
}

export function countEmojis(text: string): number {
  return (text.match(/\p{Extended_Pictographic}/gu) ?? []).length;
}

export function isValidCustomText(text: string): boolean {
  return text.length <= 100 && countEmojis(text) <= 5 && !URL_RE.test(text);
}