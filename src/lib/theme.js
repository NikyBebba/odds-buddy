export function getThemeClasses(theme) {
  const isGalatone = theme === 'galatone';
  const isRoma = theme === 'roma';

  return {
    primaryText: isRoma ? 'text-amber-400' : isGalatone ? 'text-purple-400' : 'text-emerald-400',
    primaryBg: isRoma
      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
      : isGalatone
        ? 'bg-purple-600 hover:bg-purple-500 text-slate-100'
        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    activeBtnBg: isRoma
      ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
      : isGalatone
        ? 'bg-purple-600 text-slate-950 shadow-purple-500/20'
        : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20',
    borderPrimary: isRoma
      ? 'border-amber-500/40'
      : isGalatone
        ? 'border-purple-500/40'
        : 'border-emerald-500/40',
  };
}