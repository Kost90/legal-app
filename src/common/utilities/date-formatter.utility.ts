import { DOCUMENT_LANG } from '../constants/documents-type.enum';

export function formatDateByLang(dateStr: string, lang: DOCUMENT_LANG): string {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string');
  }

  const optionsUk: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const optionsEn: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const formatter = new Intl.DateTimeFormat(
    lang === DOCUMENT_LANG.UA ? 'uk-UA' : 'en-US',
    lang === DOCUMENT_LANG.UA ? optionsUk : optionsEn,
  );

  return formatter.format(date);
}

export function parseDotDate(dateStr: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dateStr);
  if (!match) return null;

  const [, day, month, year] = match;
  const isoDate = `${year}-${month}-${day}`;
  const date = new Date(isoDate);

  return isNaN(date.getTime()) ? null : date.toISOString();
}
