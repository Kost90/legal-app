import { Transform } from 'class-transformer';
import { parseDotDate } from '../utilities/date-formatter.utility';

export function TransformDotDate() {
  return Transform(({ value }) => {
    const iso = parseDotDate(value);
    if (!iso) throw new Error(`Invalid date format: ${value}`);
    return iso;
  });
}
