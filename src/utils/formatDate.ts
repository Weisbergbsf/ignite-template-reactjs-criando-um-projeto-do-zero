import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

type DateProps = {
  date: string;
  mask?: string;
};

export function formatDate({ date, mask = 'dd MMM yyyy' }: DateProps): string {
  if (date) {
    return format(new Date(date), mask, {
      locale: ptBR,
    });
  }
  return null;
}
