// GeneZ Results Overview Component
window.ResultsOverview = function({
  data,
  onExportFasta,
  onExportCsv
}) {
  if (!data || !data.records || data.records.length === 0) return null;

  const records = data.records;
  const comp = data.comparative || {};
  const stats = comp.summary_stats || {};
  const lengthStats = stats.length || {};
  const gcStats = stats.gc || {};

  return (
    <div className="space-y-4">
      {/* Top Banner Notice if fallback or note */}
      {data.note && (
        <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-sky-200">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{data.note}</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-900/50 border border-sky-700/50 text-sky-300">
            {data.source === "ncbi_live" ? "NCBI Live API" : "Verified Reference Data"}
          </span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Records Count */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 bio-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Retrieved Records</span>
            <span className="p-1 rounded-md bg-teal-500/10 text-teal-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{records.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {data.organism} • <span className="text-teal-400 font-semibold">{data.gene}</span>
          </p>
        </div>

        {/* Card 2: Sequence Length Span */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 bio-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Length Range</span>
            <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {lengthStats.min === lengthStats.max ? `${lengthStats.min} bp` : `${lengthStats.min} - ${lengthStats.max} bp`}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Average: <span className="text-cyan-300 font-mono">{lengthStats.avg} bp</span>
          </p>
        </div>

        {/* Card 3: Average GC Content */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 bio-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Mean GC Content</span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {gcStats.avg}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            AT Content: <span className="text-amber-300 font-mono">{stats.at?.avg}%</span>
          </p>
        </div>

        {/* Card 4: Action Downloads */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 bio-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Data Export</span>
            <span className="text-[10px] text-teal-400 uppercase font-mono font-bold">Standard</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={onExportFasta}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:text-teal-300 hover:border-teal-500/50 transition flex items-center justify-center space-x-1"
              title="Download Multi-FASTA file"
            >
              <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>.FASTA</span>
            </button>
            <button
              onClick={onExportCsv}
              className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-xs font-semibold text-teal-300 border border-teal-500/30 transition flex items-center justify-center space-x-1"
              title="Download Full CSV Analysis Report"
            >
              <svg className="w-3.5 h-3.5 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>.CSV Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

