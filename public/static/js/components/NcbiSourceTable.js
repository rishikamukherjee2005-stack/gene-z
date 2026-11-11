// GeneZ NCBI Sequence Source Table Component
window.NcbiSourceTable = function({ records, activeIndex, onSelectIndex }) {
  if (!records || records.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl bio-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>NCBI Sequence Sources & Annotations</span>
            <span className="text-xs font-mono font-normal text-slate-400">({records.length} records)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Official GenBank / RefSeq nucleotide records retrieved via Entrez ESearch & ESummary.
          </p>
        </div>
        <span className="text-[11px] text-teal-400/80 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          Click any row to inspect in FASTA Viewer & Analysis
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="text-[11px] uppercase font-semibold text-slate-400 bg-slate-950/70 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Accession</th>
              <th className="py-3 px-3">Organism / Source</th>
              <th className="py-3 px-4">Definition & Annotation</th>
              <th className="py-3 px-3 text-right">Length (bp)</th>
              <th className="py-3 px-3">Molecule</th>
              <th className="py-3 px-3 text-center">NCBI Portal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {records.map((rec, idx) => {
              const isSelected = idx === activeIndex;
              const analysis = rec.analysis || {};
              const length = analysis.total_length || rec.length || 0;

              return (
                <tr
                  key={idx}
                  onClick={() => onSelectIndex(idx)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-teal-500/10 border-l-4 border-teal-500 text-white font-medium"
                      : "hover:bg-slate-800/40 text-slate-300"
                  }`}
                >
                  {/* Status Indicator */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isSelected
                          ? "bg-teal-500 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isSelected ? "Active" : `#${idx + 1}`}
                    </span>
                  </td>

                  {/* Accession */}
                  <td className="py-3.5 px-3 font-mono font-semibold text-teal-300 whitespace-nowrap">
                    {rec.accession}
                  </td>

                  {/* Organism */}
                  <td className="py-3.5 px-3 italic text-slate-200 whitespace-nowrap">
                    {rec.organism}
                  </td>

                  {/* Title / Description */}
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="line-clamp-2 text-slate-200" title={rec.title || rec.description}>
                      {rec.title || rec.description || "No annotation title available."}
                    </div>
                  </td>

                  {/* Length */}
                  <td className="py-3.5 px-3 font-mono text-right whitespace-nowrap">
                    <span className="text-white font-bold">{length.toLocaleString()}</span>
                    <span className="text-slate-500 ml-1">bp</span>
                  </td>

                  {/* Molecule Type */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-mono text-slate-300 border border-slate-700">
                      {rec.molecule_type || "DNA"}
                    </span>
                  </td>

                  {/* NCBI Link */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={rec.ncbi_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 border border-slate-700 hover:border-teal-500/40 transition text-[11px]"
                      title="Open record in NCBI Nuccore"
                    >
                      <span>NCBI</span>
                      <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

