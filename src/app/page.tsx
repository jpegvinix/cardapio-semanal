'use client';

import { useEffect, useState } from 'react';
import { WeekMenu, DayInfo, CATEGORY_LABELS } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Sparkles,
  Calendar,
  Clock,
  RefreshCw,
  ChefHat,
} from 'lucide-react';

interface ApiResponse {
  success: boolean;
  menu: WeekMenu;
  weekInfo: {
    days: DayInfo[];
    startDateStr: string;
    endDateStr: string;
    isCurrentWeek: boolean;
  };
}

export default function PublicMenuPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekId, setCurrentWeekId] = useState<string>('');
  const [activeWeekId, setActiveWeekId] = useState<string>('');

  const fetchMenu = async (weekId?: string) => {
    setLoading(true);
    try {
      const url = weekId ? `/api/menu?week=${weekId}` : '/api/menu';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse = await res.json();
        setData(json);
        setActiveWeekId(json.menu.weekId);
        if (!currentWeekId) {
          setCurrentWeekId(json.menu.weekId);
        }
      }
    } catch (err) {
      console.error('Falha ao carregar cardápio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleWeekChange = (offset: number) => {
    if (!activeWeekId) return;
    const parts = activeWeekId.split('-W');
    if (parts.length !== 2) return;
    let year = parseInt(parts[0], 10);
    let week = parseInt(parts[1], 10) + offset;
    if (week > 52) {
      week = 1;
      year += 1;
    } else if (week < 1) {
      week = 52;
      year -= 1;
    }
    const nextWeekId = `${year}-W${week.toString().padStart(2, '0')}`;
    fetchMenu(nextWeekId);
  };

  const handleResetToCurrent = () => {
    fetchMenu(currentWeekId);
  };

  const daysInfo = data?.weekInfo.days || [];
  const menuDays = data?.menu.days;

  // Verifica se a semana tem pelo menos uma refeição cadastrada
  const hasAnyMeal =
    menuDays &&
    Object.values(menuDays).some(
      (day) =>
        day.pratoPrincipal.trim() ||
        day.guarnicao.trim() ||
        day.salada.trim() ||
        day.sobremesa.trim()
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 leading-tight">
                Cardápio Semanal
              </h1>
              <p className="text-xs text-stone-500 font-medium">Cozinha da Empresa</p>
            </div>
          </div>

          <button
            onClick={() => fetchMenu(activeWeekId)}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Atualizar cardápio"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Week Selector Bar */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => handleWeekChange(-1)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center px-2">
              <div className="flex items-center justify-center space-x-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-stone-800 text-sm sm:text-base">
                  {data?.weekInfo ? `Semana de ${data.weekInfo.startDateStr} a ${data.weekInfo.endDateStr}` : 'Carregando...'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {data?.weekInfo.isCurrentWeek ? (
                  <span className="inline-flex items-center text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    Semana atual
                  </span>
                ) : (
                  <span>Semana selecionada</span>
                )}
              </p>
            </div>

            <button
              onClick={() => handleWeekChange(1)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Próxima semana"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {!data?.weekInfo.isCurrentWeek && (
            <button
              onClick={handleResetToCurrent}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors border border-amber-200/60"
            >
              Voltar para semana atual
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && !data && (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-amber-600" />
            <p className="text-sm font-medium">Carregando cardápio da semana...</p>
          </div>
        )}

        {/* Empty Week State */}
        {!loading && !hasAnyMeal && (
          <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-8 sm:p-12 text-center my-6 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-1">
              Cardápio em preparação
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Nossa equipe da cozinha está preparando as delícias desta semana. As refeições serão publicadas em breve por aqui!
            </p>
          </div>
        )}

        {/* Days List */}
        <div className="space-y-4 sm:space-y-6">
          {daysInfo.map((day) => {
            const meal = menuDays ? menuDays[day.key] : null;
            const hasFood =
              meal &&
              (meal.pratoPrincipal.trim() ||
                meal.guarnicao.trim() ||
                meal.salada.trim() ||
                meal.sobremesa.trim());

            return (
              <section
                key={day.key}
                id={day.isToday ? 'hoje' : undefined}
                className={`rounded-2xl transition-all duration-200 overflow-hidden ${
                  day.isToday
                    ? 'bg-white ring-2 ring-amber-500 shadow-md sm:shadow-lg'
                    : 'bg-white border border-stone-200/80 shadow-xs'
                }`}
              >
                {/* Header do Dia */}
                <div
                  className={`px-4 sm:px-6 py-3.5 flex items-center justify-between border-b ${
                    day.isToday
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600'
                      : 'bg-stone-50/70 border-stone-200/70 text-stone-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-base sm:text-lg">
                      {day.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        day.isToday
                          ? 'bg-amber-700/60 text-amber-50'
                          : 'bg-stone-200/80 text-stone-600'
                      }`}
                    >
                      {day.dateStr}
                    </span>
                  </div>

                  {day.isToday && (
                    <div className="flex items-center space-x-1.5 bg-white text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-xs uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Hoje</span>
                    </div>
                  )}
                </div>

                {/* Conteúdo do Dia */}
                <div className="p-4 sm:p-6">
                  {hasFood ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Prato Principal */}
                      {meal.pratoPrincipal.trim() && (
                        <div className="bg-amber-50/40 rounded-xl p-3.5 border border-amber-100">
                          <div className="flex items-center space-x-2 mb-1.5 text-amber-900 font-semibold text-xs tracking-wider uppercase">
                            <span>{CATEGORY_LABELS.pratoPrincipal.icon}</span>
                            <span>{CATEGORY_LABELS.pratoPrincipal.title}</span>
                          </div>
                          <p className="text-stone-800 font-medium text-sm leading-relaxed whitespace-pre-line">
                            {meal.pratoPrincipal}
                          </p>
                        </div>
                      )}

                      {/* Guarnição */}
                      {meal.guarnicao.trim() && (
                        <div className="bg-orange-50/30 rounded-xl p-3.5 border border-orange-100/80">
                          <div className="flex items-center space-x-2 mb-1.5 text-orange-950 font-semibold text-xs tracking-wider uppercase">
                            <span>{CATEGORY_LABELS.guarnicao.icon}</span>
                            <span>{CATEGORY_LABELS.guarnicao.title}</span>
                          </div>
                          <p className="text-stone-800 font-medium text-sm leading-relaxed whitespace-pre-line">
                            {meal.guarnicao}
                          </p>
                        </div>
                      )}

                      {/* Salada */}
                      {meal.salada.trim() && (
                        <div className="bg-emerald-50/40 rounded-xl p-3.5 border border-emerald-100">
                          <div className="flex items-center space-x-2 mb-1.5 text-emerald-900 font-semibold text-xs tracking-wider uppercase">
                            <span>{CATEGORY_LABELS.salada.icon}</span>
                            <span>{CATEGORY_LABELS.salada.title}</span>
                          </div>
                          <p className="text-stone-800 font-medium text-sm leading-relaxed whitespace-pre-line">
                            {meal.salada}
                          </p>
                        </div>
                      )}

                      {/* Sobremesa */}
                      {meal.sobremesa.trim() && (
                        <div className="bg-purple-50/40 rounded-xl p-3.5 border border-purple-100">
                          <div className="flex items-center space-x-2 mb-1.5 text-purple-900 font-semibold text-xs tracking-wider uppercase">
                            <span>{CATEGORY_LABELS.sobremesa.icon}</span>
                            <span>{CATEGORY_LABELS.sobremesa.title}</span>
                          </div>
                          <p className="text-stone-800 font-medium text-sm leading-relaxed whitespace-pre-line">
                            {meal.sobremesa}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-stone-400 text-sm italic py-2">
                      Nenhuma refeição cadastrada para este dia.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-stone-200/80 py-6 text-center text-xs text-stone-400">
        <p className="flex items-center justify-center space-x-1.5">
          <span>Feito com carinho pela equipe da cozinha</span>
          <span>•</span>
          <span className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" /> Atualizado em tempo real
          </span>
        </p>
      </footer>
    </div>
  );
}

