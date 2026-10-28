'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WeekMenu, DayInfo, DayKey, DayMeal, CATEGORY_LABELS } from '@/lib/types';
import { BanlekLogo } from '@/components/BanlekLogo';
import {
  Save,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
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

export default function EditMenuPage() {
  const routeParams = useParams();
  const token = typeof routeParams?.token === 'string' ? routeParams.token : '';

  const [data, setData] = useState<ApiResponse | null>(null);
  const [menu, setMenu] = useState<WeekMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [currentWeekId, setCurrentWeekId] = useState<string>('');
  const [activeWeekId, setActiveWeekId] = useState<string>('');

  const fetchMenu = async (weekId?: string) => {
    setLoading(true);
    setSaveStatus('idle');
    try {
      const url = weekId ? `/api/menu?week=${weekId}` : '/api/menu';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse = await res.json();
        setData(json);
        setMenu(json.menu);
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

  const handleFieldChange = (dayKey: DayKey, category: keyof DayMeal, value: string) => {
    if (!menu) return;
    setMenu({
      ...menu,
      days: {
        ...menu.days,
        [dayKey]: {
          ...menu.days[dayKey],
          [category]: value,
        },
      },
    });
    if (saveStatus === 'saved') {
      setSaveStatus('idle');
    }
  };

  const handleSave = async () => {
    if (!menu) return;
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          menu,
        }),
      });

      if (res.status === 401) {
        setAuthError(true);
        setSaveStatus('error');
        return;
      }

      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
        }, 4000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setSaveStatus('error');
    }
  };

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

  const copyPublicLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const publicUrl = `${origin}/`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-red-200 text-center shadow-card">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1F2B] mb-2">Link de edição inválido</h2>
          <p className="text-sm text-[#475366] mb-6 leading-relaxed">
            O link de edição acessado não confere com a chave de segurança configurada. Verifique com a coordenação técnica.
          </p>
          <a
            href="/"
            className="inline-flex items-center text-sm font-semibold text-[#1E7BE8] hover:text-[#1A6CD0]"
          >
            Ir para o cardápio público <ArrowRight className="w-4 h-4 ml-1.5" />
          </a>
        </div>
      </div>
    );
  }

  const daysInfo = data?.weekInfo.days || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E3E8EF] shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <BanlekLogo className="h-6 w-auto text-[#1E7BE8]" />
            </div>
            <div className="h-4 w-px bg-slate-200 hidden xs:block" />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-[#1A1F2B] leading-tight">
                  Painel da Cozinha
                </h1>
                <span className="bg-[#EAF3FD] text-[#1E7BE8] border border-[#BFDBFE] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Edição
                </span>
              </div>
              <p className="text-xs text-[#64748B]">Gerenciar Cardápio Semanal</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyPublicLink}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F1F5F9] text-[#1A1F2B] hover:bg-[#E2E8F0] transition-colors border border-[#CBD5E1]"
              title="Copiar link que os colaboradores usam para ver o cardápio"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#64748B]" />}
              <span>{copied ? 'Link copiado!' : 'Copiar link público'}</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[#64748B] hover:text-[#1E7BE8] hover:bg-[#EAF3FD] rounded-lg transition-colors"
              title="Abrir cardápio público em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Navigation & Week Bar */}
        <div className="bg-white rounded-2xl border border-[#E3E8EF] p-4 mb-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between">
            <button
              onClick={() => handleWeekChange(-1)}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0F2742] hover:bg-[#F1F5F9] transition-colors"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center px-3">
              <span className="font-bold text-[#1A1F2B] text-base sm:text-lg block">
                {data?.weekInfo ? `Semana de ${data.weekInfo.startDateStr} a ${data.weekInfo.endDateStr}` : 'Carregando...'}
              </span>
              <span className="text-xs text-[#64748B]">
                {data?.weekInfo.isCurrentWeek ? (
                  <strong className="text-emerald-600 font-semibold">Semana Vigente</strong>
                ) : (
                  <span>Próxima semana / Outra data</span>
                )}
              </span>
            </div>

            <button
              onClick={() => handleWeekChange(1)}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0F2742] hover:bg-[#F1F5F9] transition-colors"
              aria-label="Próxima semana"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleWeekChange(1)}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#EAF3FD] text-[#1E7BE8] hover:bg-[#D9EAFE] border border-[#BFDBFE] transition-colors"
            >
              Planejar Próxima Semana →
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && !menu && (
          <div className="py-20 flex flex-col items-center justify-center text-[#64748B]">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#1E7BE8]" />
            <p className="text-sm font-medium">Carregando campos do cardápio...</p>
          </div>
        )}

        {/* Form Days */}
        {menu && (
          <div className="space-y-6">
            {daysInfo.map((day) => {
              const currentMeal = menu.days[day.key];
              return (
                <div
                  key={day.key}
                  className={`bg-white rounded-2xl border transition-all ${
                    day.isToday ? 'border-[#1E7BE8] shadow-highlight ring-1 ring-[#1E7BE8]' : 'border-[#E3E8EF] shadow-card'
                  } overflow-hidden`}
                >
                  {/* Header do Card */}
                  <div
                    className={`px-4 sm:px-6 py-3 flex items-center justify-between border-b ${
                      day.isToday
                        ? 'bg-gradient-to-r from-[#1E7BE8] via-[#2488F0] to-[#2DC6F0] text-white border-[#1E7BE8]'
                        : 'bg-[#F8FAFC] border-[#E3E8EF] text-[#1A1F2B]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-base">{day.label}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          day.isToday ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#475366]'
                        }`}
                      >
                        {day.dateStr}
                      </span>
                    </div>

                    {day.isToday && (
                      <span className="text-[11px] font-extrabold uppercase bg-white text-[#1E7BE8] px-2.5 py-0.5 rounded-full tracking-wider shadow-xs">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Form Inputs */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Prato Principal */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#1E7BE8] mb-1">
                        🍗 {CATEGORY_LABELS.pratoPrincipal.title}
                      </label>
                      <textarea
                        rows={2}
                        value={currentMeal.pratoPrincipal}
                        onChange={(e) => handleFieldChange(day.key, 'pratoPrincipal', e.target.value)}
                        placeholder="Ex: Frango grelhado ao molho de ervas finas"
                        className="w-full text-sm rounded-xl border border-[#CBD5E1] p-2.5 focus:border-[#1E7BE8] focus:ring-2 focus:ring-[#1E7BE8]/20 outline-none transition resize-none bg-slate-50/40 focus:bg-white text-[#1A1F2B]"
                      />
                    </div>

                    {/* Guarnição */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#475366] mb-1">
                        🍚 {CATEGORY_LABELS.guarnicao.title}
                      </label>
                      <textarea
                        rows={2}
                        value={currentMeal.guarnicao}
                        onChange={(e) => handleFieldChange(day.key, 'guarnicao', e.target.value)}
                        placeholder="Ex: Arroz branco, feijão carioca e purê de batata"
                        className="w-full text-sm rounded-xl border border-[#CBD5E1] p-2.5 focus:border-[#1E7BE8] focus:ring-2 focus:ring-[#1E7BE8]/20 outline-none transition resize-none bg-slate-50/40 focus:bg-white text-[#1A1F2B]"
                      />
                    </div>

                    {/* Salada */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#15803D] mb-1">
                        🥗 {CATEGORY_LABELS.salada.title}
                      </label>
                      <textarea
                        rows={2}
                        value={currentMeal.salada}
                        onChange={(e) => handleFieldChange(day.key, 'salada', e.target.value)}
                        placeholder="Ex: Alface americana, tomate e cenoura ralada"
                        className="w-full text-sm rounded-xl border border-[#CBD5E1] p-2.5 focus:border-[#1E7BE8] focus:ring-2 focus:ring-[#1E7BE8]/20 outline-none transition resize-none bg-slate-50/40 focus:bg-white text-[#1A1F2B]"
                      />
                    </div>

                    {/* Sobremesa */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#7E22CE]">
                          🍮 {CATEGORY_LABELS.sobremesa.title}
                        </label>
                        <span className="text-[11px] text-[#64748B] font-normal">opcional</span>
                      </div>
                      <textarea
                        rows={2}
                        value={currentMeal.sobremesa}
                        onChange={(e) => handleFieldChange(day.key, 'sobremesa', e.target.value)}
                        placeholder="Ex: Pudim de leite, fruta ou deixe em branco"
                        className="w-full text-sm rounded-xl border border-[#CBD5E1] p-2.5 focus:border-[#1E7BE8] focus:ring-2 focus:ring-[#1E7BE8]/20 outline-none transition resize-none bg-slate-50/40 focus:bg-white text-[#1A1F2B]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Bar for Save Action */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3E8EF] p-3 sm:p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs text-[#64748B] hidden sm:block">
            <span>Dica: Salve sempre que fizer alterações importantes no cardápio.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {saveStatus === 'saved' && (
              <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <Check className="w-4 h-4 mr-1 text-emerald-600" />
                Salvo com sucesso!
              </span>
            )}

            {saveStatus === 'error' && (
              <span className="flex items-center text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
                Não foi possível salvar. Tente novamente.
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving' || loading}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] ${
                saveStatus === 'saving'
                  ? 'bg-[#1E7BE8]/60 cursor-not-allowed'
                  : 'bg-[#1E7BE8] hover:bg-[#1A6CD0] hover:shadow-highlight'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Salvando alterações...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Cardápio</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
