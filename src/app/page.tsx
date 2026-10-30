'use client';

import { useEffect, useState } from 'react';
import { WeekMenu, DayInfo, CATEGORY_LABELS } from '@/lib/types';
import { offsetWeekId } from '@/lib/date-utils';
import { BanlekLogo } from '@/components/BanlekLogo';
import {
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Sparkles,
  Calendar,
  RefreshCw,
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
    fetchMenu(offsetWeekId(activeWeekId, offset));
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
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E3E8EF] shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <BanlekLogo className="h-6 w-auto text-[#1E7BE8]" />
            </div>
            <div className="h-4 w-px bg-slate-200 hidden xs:block" />
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#1A1F2B] leading-tight">
                Cardápio da Cozinha
              </h1>
              <p className="text-xs text-[#64748B] font-medium">Alimentação do time Banlek</p>
            </div>
          </div>

          <button
            onClick={() => fetchMenu(activeWeekId)}
            className="p-2 text-[#64748B] hover:text-[#1E7BE8] hover:bg-[#EAF3FD] rounded-xl transition-colors"
            title="Atualizar cardápio"
            aria-label="Atualizar cardápio"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1E7BE8]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Week Selector Bar */}
        <div className="bg-white rounded-2xl border border-[#E3E8EF] p-3 sm:p-4 mb-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => handleWeekChange(-1)}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0F2742] hover:bg-[#F1F5F9] transition-colors"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center px-2">
              <div className="flex items-center justify-center space-x-1.5">
                <Calendar className="w-4 h-4 text-[#1E7BE8]" />
                <span className="font-semibold text-[#1A1F2B] text-sm sm:text-base">
                  {data?.weekInfo ? `Semana de ${data.weekInfo.startDateStr} a ${data.weekInfo.endDateStr}` : 'Carregando...'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                {data?.weekInfo.isCurrentWeek ? (
                  <span className="inline-flex items-center text-emerald-600 font-semibold">
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
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0F2742] hover:bg-[#F1F5F9] transition-colors"
              aria-label="Próxima semana"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {!data?.weekInfo.isCurrentWeek && (
            <button
              onClick={handleResetToCurrent}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-[#EAF3FD] text-[#1E7BE8] hover:bg-[#D9EAFE] transition-colors border border-[#BFDBFE]"
            >
              Voltar para semana atual
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && !data && (
          <div className="py-20 flex flex-col items-center justify-center text-[#64748B]">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#1E7BE8]" />
            <p className="text-sm font-medium">Carregando cardápio da semana...</p>
          </div>
        )}

        {/* Empty Week State */}
        {!loading && !hasAnyMeal && (
          <div className="bg-white rounded-3xl border border-dashed border-[#CBD5E1] p-8 sm:p-12 text-center my-6 shadow-card">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EAF3FD] flex items-center justify-center text-[#1E7BE8] mb-4">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1F2B] mb-1">
              Cardápio em preparação
            </h3>
            <p className="text-sm text-[#475366] max-w-md mx-auto">
              Nossa equipe da cozinha Banlek está preparando as refeições desta semana. Os pratos serão publicados em breve por aqui!
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
                    ? 'bg-white ring-2 ring-[#1E7BE8] shadow-highlight'
                    : 'bg-white border border-[#E3E8EF] shadow-card'
                }`}
              >
                {/* Header do Dia */}
                <div
                  className={`px-4 sm:px-6 py-3.5 flex items-center justify-between border-b ${
                    day.isToday
                      ? 'bg-gradient-to-r from-[#1E7BE8] via-[#2488F0] to-[#2DC6F0] text-white border-[#1E7BE8]'
                      : 'bg-[#F8FAFC] border-[#E3E8EF] text-[#1A1F2B]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-base sm:text-lg">
                      {day.label}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        day.isToday
                          ? 'bg-white/20 text-white backdrop-blur-xs'
                          : 'bg-[#E2E8F0] text-[#475366]'
                      }`}
                    >
                      {day.dateStr}
                    </span>
                  </div>

                  {day.isToday && (
                    <div className="flex items-center space-x-1.5 bg-white text-[#1E7BE8] text-xs font-extrabold px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-[#2DC6F0]" />
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
                        <div className="bg-[#F0F7FF] rounded-xl p-4 border border-[#BFDBFE]">
                          <div className="flex items-center space-x-2 mb-1.5 text-[#1E7BE8] font-bold text-xs tracking-wider uppercase">
                            <span>{CATEGORY_LABELS.pratoPrincipal.icon}</span>
                            <span>{CATEGORY_LABELS.pratoPrincipal.title}</span>
                          </div>
                          <p className="text-[#0F2742] font-semibold text-sm leading-relaxed whitespace-pre-line">
                            {meal.pratoPrincipal}
                          </p>
                        </div>
                      )}

                      {/* Guarnição */}
                      {meal.guarnicao.trim() && (
                        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                          <div className="flex items-center space-x-2 mb-1.5 text-[#475366] font-bold text-xs tracking-wider uppercase">
                            <span>{CATEGORY_LABELS.guarnicao.icon}</span>
                            <span>{CATEGORY_LABELS.guarnicao.title}</span>
                          </div>
                          <p className="text-[#1A1F2B] font-medium text-sm leading-relaxed whitespace-pre-line">
                            {meal.guarnicao}
                          </p>
                        </div>
                      )}

                      {/* Salada */}
                      {meal.salada.trim() && (
                        <div className="bg-[#F0FDF4] rounded-xl p-4 border border-[#BBF7D0]">
                          <div className="flex items-center space-x-2 mb-1.5 text-[#15803D] font-bold text-xs tracking-wider uppercase">
                            <span>{CATEGORY_LABELS.salada.icon}</span>
                            <span>{CATEGORY_LABELS.salada.title}</span>
                          </div>
                          <p className="text-[#14532D] font-medium text-sm leading-relaxed whitespace-pre-line">
                            {meal.salada}
                          </p>
                        </div>
                      )}

                      {/* Sobremesa */}
                      {meal.sobremesa.trim() && (
                        <div className="bg-[#FAF5FF] rounded-xl p-4 border border-[#E9D5FF]">
                          <div className="flex items-center space-x-2 mb-1.5 text-[#7E22CE] font-bold text-xs tracking-wider uppercase">
                            <span>{CATEGORY_LABELS.sobremesa.icon}</span>
                            <span>{CATEGORY_LABELS.sobremesa.title}</span>
                          </div>
                          <p className="text-[#581C87] font-medium text-sm leading-relaxed whitespace-pre-line">
                            {meal.sobremesa}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[#64748B] text-sm italic py-2">
                      Nenhuma refeição cadastrada para este dia.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
