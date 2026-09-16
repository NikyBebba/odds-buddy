import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamName = searchParams.get('team') || '';

  if (!teamName) {
    return NextResponse.json({ success: false, error: 'Manca il parametro team.' }, { status: 400 });
  }

  const cacheKey = teamName.toLowerCase();
  if (CACHE.has(cacheKey)) {
    return NextResponse.json({ success: true, venue: CACHE.get(cacheKey) });
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

    CACHE.set(cacheKey, venue);
    return NextResponse.json({ success: true, venue });
  } catch (err) {
    console.error('Route /api/venue error:', err.message);
    return NextResponse.json({ success: true, venue: null });
  }
}