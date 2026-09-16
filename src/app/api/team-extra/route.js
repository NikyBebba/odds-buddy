import { NextResponse } from 'next/server';
import { getTeamExtras } from '@/lib/bigballs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const leagueKey = searchParams.get('league') || 'serieA';
  const homeName = searchParams.get('home') || '';
  const awayName = searchParams.get('away') || '';

  const apiKey = process.env.BIGBALLS_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Manca la chiave BIGBALLS_KEY nel server.' }, { status: 500 });
  }

  try {
    const teamExtras = await getTeamExtras({ leagueKey, homeName, awayName, apiKey });
    return NextResponse.json({ success: true, teamExtras });
  } catch (err) {
    console.error('Route /api/team-extra error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}