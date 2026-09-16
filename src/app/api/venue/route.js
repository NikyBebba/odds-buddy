import { NextResponse } from 'next/server';
import { getJSON, setJSON } from '@/lib/kv';

export const dynamic = 'force-dynamic';

// Lo stadio cambia raramente: lo salviamo per 30 giorni
const CACHE_TTL_S = 60 * 60 * 24 * 30;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamName = searchParams.get('team') || '';

  if (!teamName) {
    return NextResponse.json({ success: false, error: 'Manca il parametro team.' }, { status: 400 });
  }

  const cacheKey = `venue:${teamName.toLowerCase()}`;
  const cached = await getJSON(cacheKey);
  if (cached) {
    return NextResponse.json({ success: true, venue: cached });
  }

  try {
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    const team = data?.teams?.[0];
    if (!team) {
      return NextResponse.json({ success: true, venue: null });
    }

    const venue = {
      name: team.strStadium || null,
      capacity: team.intStadiumCapacity || null,
      location: team.strLocation || null,
      badge: team.strBadge || team.strLogo || null,
    };

    await setJSON(cacheKey, venue, CACHE_TTL_S);
    return NextResponse.json({ success: true, venue });
  } catch (err) {
    console.error('Route /api/venue error:', err.message);
    return NextResponse.json({ success: true, venue: null });
  }
}