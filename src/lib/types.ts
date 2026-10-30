export type DayKey = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta';

export interface DayMeal {
  pratoPrincipal: string;
  guarnicao: string;
  salada: string;
  sobremesa: string;
  cafeDaTarde?: string;
  jantar?: string;
}

export type ExtraMealKey = 'cafeDaTarde' | 'jantar';

export const EXTRA_MEALS: ExtraMealKey[] = ['cafeDaTarde', 'jantar'];

export interface DayInfo {
  key: DayKey;
  label: string; // "Segunda-feira", etc.
  shortLabel: string; // "Seg", "Ter", etc.
  dateStr: string; // "28/10"
  fullDateStr: string; // "28 de Outubro"
  isToday: boolean;
}

export interface WeekMenu {
  weekId: string; // ex: "2026-W44"
  startDate: string; // "26/10"
  endDate: string; // "30/10"
  year: number;
  weekNumber: number;
  updatedAt?: string;
  days: {
    segunda: DayMeal;
    terca: DayMeal;
    quarta: DayMeal;
    quinta: DayMeal;
    sexta: DayMeal;
  };
}

export const CATEGORY_LABELS: Record<keyof DayMeal, { title: string; icon: string }> = {
  pratoPrincipal: { title: 'Prato Principal', icon: '🍲' },
  guarnicao: { title: 'Guarnição', icon: '🍚' },
  salada: { title: 'Salada', icon: '🥗' },
  sobremesa: { title: 'Sobremesa', icon: '🍮' },
  cafeDaTarde: { title: 'Café da tarde', icon: '☕' },
  jantar: { title: 'Jantar', icon: '🍽️' },
};

export const EMPTY_DAY_MEAL: DayMeal = {
  pratoPrincipal: '',
  guarnicao: '',
  salada: '',
  sobremesa: '',
};

export function hasMealContent(day: DayMeal): boolean {
  return Object.values(day).some((value) => value?.trim());
}

export function createEmptyWeekMenu(weekId: string, startDate = '', endDate = '', year = 2026, weekNumber = 1): WeekMenu {
  return {
    weekId,
    startDate,
    endDate,
    year,
    weekNumber,
    days: {
      segunda: { ...EMPTY_DAY_MEAL },
      terca: { ...EMPTY_DAY_MEAL },
      quarta: { ...EMPTY_DAY_MEAL },
      quinta: { ...EMPTY_DAY_MEAL },
      sexta: { ...EMPTY_DAY_MEAL },
    },
  };
}

