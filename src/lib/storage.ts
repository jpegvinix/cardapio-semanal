import fs from 'fs';
import path from 'path';
import { WeekMenu, createEmptyWeekMenu } from './types';
import { getWeekDaysInfo } from './date-utils';

// Token secreto para edição. Sem a variável de ambiente, ninguém consegue salvar.
export const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;

// Memória cache em tempo de execução
const memoryStore = new Map<string, WeekMenu>();

// Caminho do arquivo para desenvolvimento local
const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'data');
const LOCAL_STORAGE_FILE = path.join(LOCAL_STORAGE_DIR, 'menus.json');

function getUpstashCredentials() {
  const url =
    process.env.cardapiosemanal_KV_REST_API_URL ||
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.cardapiosemanal_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

/**
 * Lê todos os menus do arquivo local (usado apenas quando não há Upstash/KV configurado)
 */
function readLocalFile(): Record<string, WeekMenu> {
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[Storage] Não foi possível ler arquivo local, usando memória:', err);
  }
  return {};
}

/**
 * Salva no arquivo local
 */
function writeLocalFile(data: Record<string, WeekMenu>): boolean {
  try {
    if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
      fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('[Storage] Não foi possível salvar arquivo local:', err);
    return false;
  }
}

/**
 * Busca o cardápio de uma semana específica
 */
export async function getWeekMenu(weekId: string): Promise<WeekMenu> {
  const upstash = getUpstashCredentials();

  if (upstash) {
    try {
      const res = await fetch(`${upstash.url}/get/menu:${weekId}`, {
        headers: {
          Authorization: `Bearer ${upstash.token}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          // Registros antigos foram gravados como ["{...}"]
          return (Array.isArray(parsed) ? JSON.parse(parsed[0]) : parsed) as WeekMenu;
        }
      }
    } catch (err) {
      console.error('[Storage KV] Erro ao buscar menu:', err);
    }
  }

  // Fallback 1: Memória
  if (memoryStore.has(weekId)) {
    return memoryStore.get(weekId)!;
  }

  // Fallback 2: Arquivo local
  const fileData = readLocalFile();
  if (fileData[weekId]) {
    memoryStore.set(weekId, fileData[weekId]);
    return fileData[weekId];
  }

  // Se ainda não existir, cria vazio com as datas calculadas
  const info = getWeekDaysInfo(weekId);
  return createEmptyWeekMenu(weekId, info.startDateStr, info.endDateStr);
}

/**
 * Salva o cardápio de uma semana. Retorna false se nada foi gravado de forma durável.
 */
export async function saveWeekMenu(menu: WeekMenu): Promise<boolean> {
  const upstash = getUpstashCredentials();
  menu.updatedAt = new Date().toISOString();

  // Se Upstash configurado, envia para a nuvem
  if (upstash) {
    try {
      const res = await fetch(`${upstash.url}/set/menu:${menu.weekId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstash.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menu),
      });
      if (res.ok) {
        memoryStore.set(menu.weekId, menu);
        return true;
      }
      console.error('[Storage KV] Upstash recusou o salvamento:', res.status);
    } catch (err) {
      console.error('[Storage KV] Erro ao salvar menu no Upstash:', err);
    }
    return false;
  }

  // Na Vercel o disco não é durável: sem KV, o salvamento se perderia
  if (process.env.VERCEL) {
    console.error('[Storage] KV não configurado na Vercel.');
    return false;
  }

  // Salva no arquivo local
  const fileData = readLocalFile();
  fileData[menu.weekId] = menu;
  if (!writeLocalFile(fileData)) {
    return false;
  }
  memoryStore.set(menu.weekId, menu);
  return true;
}

