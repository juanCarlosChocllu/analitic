import { log } from 'console';
import {
  eachDayOfInterval,
  isSunday,
  differenceInBusinessDays,
} from 'date-fns';

export function diasHAbiles(fechaInicio: string, fechaFin: string) {
  const fecha1 = new Date(fechaInicio);
  const fecha2 = new Date(fechaFin);

  const dias = eachDayOfInterval({ start: fecha1, end: fecha2 });
  const diasHAbiles = dias.filter((dia) => !isSunday(dia));

  return diasHAbiles.length;
}
