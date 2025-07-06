import { Transform } from 'class-transformer';

export function TransformDotDate() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return;
    }

    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
    if (!match) {
      return new Date('invalid');
    }

    const [, day, month, year] = match;

    const isoDateStr = `${year}-${month}-${day}`;
    const date = new Date(isoDateStr);

    if (isNaN(date.getTime())) {
      return new Date('invalid');
    }

    return date;
  });
}
