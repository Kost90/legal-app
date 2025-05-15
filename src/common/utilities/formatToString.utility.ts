export function FormatToString(obj: Record<string, any>): string {
  if (typeof obj === 'object') {
    return Object.values(obj).join(', ');
  }

  return null;
}
