import { NextRequest, NextResponse } from 'next/server';
import { getWeekMenu, saveWeekMenu, ADMIN_SECRET_TOKEN } from '@/lib/storage';
import { getWeekId, getWeekDaysInfo, getNowInTimezone } from '@/lib/date-utils';
import { WeekMenu } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week');
    const weekId = weekParam || getWeekId(getNowInTimezone());

    const menu = await getWeekMenu(weekId);
    const weekInfo = getWeekDaysInfo(weekId);

    return NextResponse.json({
      success: true,
      menu,
      weekInfo,
    });
  } catch (error) {
    console.error('[API /api/menu GET Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao carregar o cardápio.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, menu } = body as { token?: string; menu?: WeekMenu };

    if (!token || token !== ADMIN_SECRET_TOKEN) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado. Link de edição inválido.' },
        { status: 401 }
      );
    }

    if (!menu || !menu.weekId || !menu.days) {
      return NextResponse.json(
        { success: false, message: 'Formato de cardápio inválido.' },
        { status: 400 }
      );
    }

    await saveWeekMenu(menu);

    return NextResponse.json({
      success: true,
      message: 'Cardápio salvo com sucesso!',
      menu,
    });
  } catch (error) {
    console.error('[API /api/menu POST Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Não foi possível salvar. Tente novamente.' },
      { status: 500 }
    );
  }
}
