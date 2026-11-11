// GeneZ Sequence Metrics Component
window.SequenceMetrics = function({ record }) {
  if (!record || !record.analysis) return null;

  const analysis = record.analysis;
  const counts = analysis.counts || {};
  const pcts = analysis.percentages || {};
  const amb = analysis.ambiguous_details || {};
  const bio = analysis.biochemical_metrics || {};

  const gc = pcts.GC || 0;
  const at = pcts.AT || 0;
  const ambPct = pcts.ambiguous || 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl bio-card space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>DNA Composition & Biochemical Metrics</span>
            <span className="text-xs font-mono font-medium text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {record.accession}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calculated nucleotide distributions, thermodynamic stability (Tm), and ambiguous base assessment.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Total Bases:</span>
          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            {analysis.total_length.toLocaleString()} bp
          </span>
        </div>
      </div>

      {/* GC vs AT Primary Visual Gauge Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-semibold mb-2">
          <span className="text-teal-300 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span>
            <span>GC Content: {gc}%</span>
            <span className="text-[10px] text-slate-400 font-normal">({counts.G + counts.C} bp)</span>
          </span>
          <span className="text-amber-300 flex items-center space-x-1.5">
            <span>AT Content: {at}%</span>
            <span className="text-[10px] text-slate-400 font-normal">({counts.A + counts.T} bp)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
          <div
            style={{ width: `${gc}%` }}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
            title={`GC Content: ${gc}%`}
          ></div>
          <div
            style={{ width: `${at}%` }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            title={`AT Content: ${at}%`}
          ></div>
          {ambPct > 0 && (
            <div
              style={{ width: `${ambPct}%` }}
              className="bg-purple-500 transition-all duration-500"
              title={`Ambiguous Bases: ${ambPct}%`}
            ></div>
          )}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>G-C Bonds: 3 Hydrogen Bonds (High Thermal Stability)</span>
          <span>A-T Bonds: 2 Hydrogen Bonds</span>
        </div>
      </div>

      {/* 4 Canonical Nucleotide Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Adenine */}
        <div className="bg-slate-950/80 border border-emerald-500/20 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-emerald-400">Adenine (A)</span>
            <span className="text-lg font-bold font-mono text-white">{pcts.A}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
            {counts.A?.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Purine (6-aminopurine)</div>
          <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
            <div style={{ width: `${pcts.A}%` }} className="bg-emerald-400 h-full"></div>
          </div>
        </div>

        {/* Thymine */}
        <div className="bg-slate-950/80 border border-red-500/20 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-red-400">Thymine (T)</span>
            <span className="text-lg font-bold font-mono text-white">{pcts.T}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-red-300 mt-1">
            {counts.T?.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pyrimidine (5-methyluracil)</div>
          <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
            <div style={{ width: `${pcts.T}%` }} className="bg-red-400 h-full"></div>
          </div>
        </div>

        {/* Guanine */}
        <div className="bg-slate-950/80 border border-blue-500/20 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-blue-400">Guanine (G)</span>
            <span className="text-lg font-bold font-mono text-white">{pcts.G}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-blue-300 mt-1">
            {counts.G?.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Purine (2-amino-6-oxopurine)</div>
          <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
            <div style={{ width: `${pcts.G}%` }} className="bg-blue-400 h-full"></div>
          </div>
        </div>

        {/* Cytosine */}
        <div className="bg-slate-950/80 border border-yellow-500/20 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-yellow-400">Cytosine (C)</span>
            <span className="text-lg font-bold font-mono text-white">{pcts.C}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-yellow-300 mt-1">
            {counts.C?.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pyrimidine (4-aminopyrimidin-2-one)</div>
          <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
            <div style={{ width: `${pcts.C}%` }} className="bg-yellow-400 h-full"></div>
          </div>
        </div>
      </div>

      {/* Ambiguous Nucleotide Status Alert */}
      {counts.ambiguous > 0 ? (
        <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
              <span>Ambiguous IUPAC Nucleotides Detected:</span>
              <span className="font-mono text-purple-200">{counts.ambiguous} ({pcts.ambiguous}%)</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700">
              IUPAC Degenerate Code
            </span>
          </div>
          {amb.breakdown && Object.keys(amb.breakdown).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {Object.entries(amb.breakdown).map(([code, info]) => (
                <span key={code} className="px-2 py-1 rounded bg-slate-950 border border-purple-500/30 text-purple-200 font-mono">
                  <strong>{code}</strong>: {info.count} ({info.meaning})
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Zero ambiguous nucleotides (100% canonical A, T, G, C)</span>
          </span>
          <span className="font-mono text-[11px] text-slate-500">IUPAC Complete</span>
        </div>
      )}

      {/* Thermodynamic and Biochemical Estimations Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* Estimated Tm */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400">Estimated Melting Temp (Tm)</div>
          <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
            {bio.melting_temperature_c} °C
          </div>
          <div className="text-[9px] text-slate-400 truncate" title={bio.tm_method}>
            {bio.tm_method || "Standard Marmur-Doty"}
          </div>
        </div>

        {/* Molecular Weight */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400">Estimated MW (ssDNA)</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">
            {bio.molecular_weight_kda} kDa
          </div>
          <div className="text-[9px] text-slate-400">Average ~330 Da / dNTP</div>
        </div>

        {/* Purine / Pyrimidine Ratio */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400">Purine / Pyrimidine Ratio</div>
          <div className="text-lg font-bold font-mono text-teal-300 mt-0.5">
            {bio.purine_pyrimidine_ratio !== null ? bio.purine_pyrimidine_ratio : "N/A"}
          </div>
          <div className="text-[9px] text-slate-400">
            Purines: {bio.purines} | Pyrimidines: {bio.pyrimidines}
          </div>
        </div>

        {/* CpG Island Sites */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] text-slate-400">CpG Dinucleotide Sites</div>
          <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
            {bio.cpg_islands_count}
          </div>
          <div className="text-[9px] text-slate-400">Methylation / Epigenetic targets</div>
        </div>
      </div>
    </div>
  );
};

