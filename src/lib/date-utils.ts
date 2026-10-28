import { DayInfo, DayKey } from './types';

export const TIMEZONE = 'America/Sao_Paulo';

/**
 * Obtém a data/hora atual no fuso configurado
 */
export function getNowInTimezone(): Date {
  const now = new Date();
  const tzDateStr = now.toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(tzDateStr);
}

/**
 * Retorna o número da semana ISO e ano para uma data
 */
export function getISOWeek(d: Date): { year: number; week: number } {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // Quarta-feira na semana atual determina o ano ISO
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getFullYear(), week: weekNo };
}

/**
 * Identificador padrão de semana: YYYY-Www (ex: 2026-W44)
 */
export function getWeekId(date: Date = getNowInTimezone()): string {
  const { year, week } = getISOWeek(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Retorna a segunda-feira da semana ISO indicada
 */
export function getMondayOfISOWeek(year: number, week: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = simple.getDay();
  const ISOweekStart = simple;
  if (dayOfWeek <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

/**
 * Faz parse de uma semana no formato "YYYY-Www"
 */
export function parseWeekId(weekId: string): { year: number; week: number } {
  const parts = weekId.split('-W');
  if (parts.length === 2) {
    const year = parseInt(parts[0], 10);
    const week = parseInt(parts[1], 10);
    if (!isNaN(year) && !isNaN(week)) {
      return { year, week };
    }
  }
  return getISOWeek(getNowInTimezone());
}

/**
 * Desloca o weekId por um delta (ex: +1 para próxima semana, -1 para anterior)
 */
export function offsetWeekId(weekId: string, delta: number): string {
  const { year, week } = parseWeekId(weekId);
  const monday = getMondayOfISOWeek(year, week);
  monday.setDate(monday.getDate() + delta * 7);
  return getWeekId(monday);
}

const DAY_KEYS: DayKey[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
const DAY_LABELS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
const DAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Retorna a lista detalhada de dias (segunda a sexta) para o weekId informado
 */
export function getWeekDaysInfo(weekId: string): {
  days: DayInfo[];
  startDateStr: string;
  endDateStr: string;
  isCurrentWeek: boolean;
} {
  const now = getNowInTimezone();
  const currentWeekId = getWeekId(now);
  const { year, week } = parseWeekId(weekId);
  const monday = getMondayOfISOWeek(year, week);

  const days: DayInfo[] = [];

  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  for (let i = 0; i < 5; i++) {
    const dayDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dayNum = dayDate.getDate().toString().padStart(2, '0');
    const monthNum = (dayDate.getMonth() + 1).toString().padStart(2, '0');
    const isToday =
      dayDate.getFullYear() === todayYear &&
      dayDate.getMonth() === todayMonth &&
      dayDate.getDate() === todayDate;

    days.push({
      key: DAY_KEYS[i],
      label: DAY_LABELS[i],
      shortLabel: DAY_SHORT[i],
      dateStr: `${dayNum}/${monthNum}`,
      fullDateStr: `${dayDate.getDate()} de ${MONTHS_PT[dayDate.getMonth()]}`,
      isToday,
    });
  }

  const startDateStr = days[0].dateStr;
  const endDateStr = days[4].dateStr;

  return {
    days,
    startDateStr,
    endDateStr,
    isCurrentWeek: weekId === currentWeekId,
  };
}

