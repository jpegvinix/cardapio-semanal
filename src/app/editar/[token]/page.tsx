'use client';

import { useEffect, useState, use } from 'react';
import { WeekMenu, DayInfo, DayKey, DayMeal, CATEGORY_LABELS } from '@/lib/types';
import {
  Save,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Sparkles,
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

export default function EditMenuPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

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
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-red-200 text-center shadow-lg">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Link de edição inválido</h2>
          <p className="text-sm text-stone-600 mb-6 leading-relaxed">
            O link de edição acessado não confere com a chave de segurança configurada. Verifique com a coordenação ou responsável técnico.
          </p>
          <a
            href="/"
            className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800"
          >
            Ir para o cardápio público <ArrowRight className="w-4 h-4 ml-1.5" />
          </a>
        </div>
      </div>
    );
  }

  const daysInfo = data?.weekInfo.days || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                  Painel da Cozinha
                </h1>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Edição
                </span>
              </div>
              <p className="text-xs text-stone-500">Editar Cardápio Semanal</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyPublicLink}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
              title="Copiar link que os colaboradores usam para ver o cardápio"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link copiado!' : 'Copiar link do cardápio'}</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
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
        <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between">
            <button
              onClick={() => handleWeekChange(-1)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center px-3">
              <span className="font-bold text-stone-900 text-base sm:text-lg block">
                {data?.weekInfo ? `Semana de ${data.weekInfo.startDateStr} a ${data.weekInfo.endDateStr}` : 'Carregando...'}
              </span>
              <span className="text-xs text-stone-500">
                {data?.weekInfo.isCurrentWeek ? (
                  <strong className="text-emerald-700 font-semibold">Semana Vigente</strong>
                ) : (
                  <span>Próxima semana / Outra data</span>
                )}
              </span>
            </div>

            <button
              onClick={() => handleWeekChange(1)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Próxima semana"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleWeekChange(1)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
            >
              Planejar Próxima Semana →
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && !menu && (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-amber-600" />
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
                    day.isToday ? 'border-amber-400 shadow-md ring-1 ring-amber-400' : 'border-stone-200/90 shadow-xs'
                  } overflow-hidden`}
                >
                  {/* Card Header */}
                  <div
                    className={`px-4 sm:px-6 py-3 flex items-center justify-between border-b ${
                      day.isToday
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-stone-50/80 text-stone-800 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-base">{day.label}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          day.isToday ? 'bg-amber-700/60 text-white' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {day.dateStr}
                      </span>
                    </div>
                    {day.isToday && (
                      <span className="text-xs font-bold bg-white text-amber-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-amber-600" /> Hoje
                      </span>
                    )}
                  </div>

                  {/* 4 Categorias Inputs */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Prato Principal */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                        🍲 {CATEGORY_LABELS.pratoPrincipal.title}
                      </label>
                      <textarea
                        rows={2}
                        value={currentMeal.pratoPrincipal}
                        onChange={(e) => handleFieldChange(day.key, 'pratoPrincipal', e.target.value)}
                        placeholder="Ex: Frango assado com ervas"
                        className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none bg-stone-50/30 focus:bg-white"
                      />
                    </div>

                    {/* Guarnição */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-orange-950 mb-1">
                        🍚 {CATEGORY_LABELS.guarnicao.title}
                      </label>
                      <textarea
                        rows={2}
                        value={currentMeal.guarnicao}
                        onChange={(e) => handleFieldChange(day.key, 'guarnicao', e.target.value)}
                        placeholder="Ex: Arroz branco, feijão carioca e purê de batata"
                        className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none bg-stone-50/30 focus:bg-white"
                      />
                    </div>

                    {/* Salada */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1">
                        🥗 {CATEGORY_LABELS.salada.title}
                      </label>
                      <textarea
                        rows={2}
                        value={currentMeal.salada}
                        onChange={(e) => handleFieldChange(day.key, 'salada', e.target.value)}
                        placeholder="Ex: Alface americana, tomate e cenoura ralada"
                        className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none bg-stone-50/30 focus:bg-white"
                      />
                    </div>

                    {/* Sobremesa */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 mb-1">
                        🍮 {CATEGORY_LABELS.sobremesa.title}
                      </label>
                      <textarea
                        rows={2}
                        value={currentMeal.sobremesa}
                        onChange={(e) => handleFieldChange(day.key, 'sobremesa', e.target.value)}
                        placeholder="Ex: Pudim de leite ou fruta da estação"
                        className="w-full text-sm rounded-xl border border-stone-200 p-2.5 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition resize-none bg-stone-50/30 focus:bg-white"
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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 sm:p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs text-stone-500 hidden sm:block">
            <span>Dica: Salve sempre que fizer alterações importantes.</span>
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
                  ? 'bg-amber-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 hover:shadow-lg'
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
