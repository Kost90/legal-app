import { DOCUMENT_LANG } from '../constants/documents-type.enum';

export function formatDateByLang(date: Date, lang: DOCUMENT_LANG): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date object provided');
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  if (lang === DOCUMENT_LANG.UA) {
    const formatter = new Intl.DateTimeFormat('uk-UA', options);
    const formattedDate = formatter.format(date);

    return formattedDate.replace('р.', 'року');
  }

  const formatter = new Intl.DateTimeFormat('en-US', options);
  return formatter.format(date);
}
