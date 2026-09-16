'use client';

export default function VenueInfo({ venue, teamName }) {
  if (!venue?.name) return null;

  return (
    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center space-y-0.5">
      <p className="text-[10px] text-slate-500 font-mono">{teamName}</p>
      <p className="text-[11px] text-slate-300 font-bold leading-tight">🏟️ {venue.name}</p>
      {venue.location && <p className="text-[10px] text-slate-500 font-mono">{venue.location}</p>}
      {venue.capacity && <p className="text-[10px] text-slate-500 font-mono">👥 {Number(venue.capacity).toLocaleString('it-IT')} posti</p>}
    </div>
  );
}