'use client';

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="max-w-5xl mx-auto mb-6 flex justify-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
      <div className="relative w-full md:w-96">
        <input
          type="text"
          placeholder="Cerca squadra (es. Inter, Milan, Real)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all"
        />
        <span className="absolute left-3 top-3 text-slate-500 text-xs">🔍</span>
      </div>
    </div>
  );
}
