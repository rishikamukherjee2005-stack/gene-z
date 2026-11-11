// GeneZ Advanced BioTools Component
// Pairwise Alignment (Needleman-Wunsch), Identity Matrix, Reverse Complement & 6-Frame Translation
window.BioToolsSection = function({ records }) {
  if (!records || records.length === 0) return null;

  const [activeTab, setActiveTab] = React.useState("align"); // 'align', 'matrix', 'translate'

  // Alignment State
  const [seq1Idx, setSeq1Idx] = React.useState(0);
  const [seq2Idx, setSeq2Idx] = React.useState(records.length > 1 ? 1 : 0);
  const [alignResult, setAlignResult] = React.useState(null);
  const [isAligning, setIsAligning] = React.useState(false);

  // Identity Matrix State
  const [matrixData, setMatrixData] = React.useState(null);
  const [isMatrixLoading, setIsMatrixLoading] = React.useState(false);

  // Translation State
  const [transSeqIdx, setTransSeqIdx] = React.useState(0);
  const [transResult, setTransResult] = React.useState(null);
  const [isTranslating, setIsTranslating] = React.useState(false);

  // Handle Run Alignment
  const handleRunAlignment = async () => {
    const s1 = records[seq1Idx]?.analysis?.full_cleaned_sequence || "";
    const s2 = records[seq2Idx]?.analysis?.full_cleaned_sequence || "";
    if (!s1 || !s2) return;

    setIsAligning(true);
    try {
      const resp = await fetch("/api/align", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seq1: s1,
          seq2: s2,
          acc1: records[seq1Idx]?.accession || "Seq 1",
          acc2: records[seq2Idx]?.accession || "Seq 2"
        })
      });
      const data = await resp.json();
      setAlignResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAligning(false);
    }
  };

  // Handle Identity Matrix
  const handleLoadMatrix = async () => {
    if (records.length < 2) return;
    setIsMatrixLoading(true);
    try {
      const resp = await fetch("/api/identity-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records })
      });
      const data = await resp.json();
      if (data.success) {
        setMatrixData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMatrixLoading(false);
    }
  };

  // Handle Translation
  const handleTranslate = async (idx) => {
    const targetIdx = idx !== undefined ? idx : transSeqIdx;
    const dna = records[targetIdx]?.analysis?.full_cleaned_sequence || "";
    if (!dna) return;

    setIsTranslating(true);
    try {
      const resp = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dna })
      });
      const data = await resp.json();
      if (data.success) {
        setTransResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  // Auto-translate on mount / selection
  React.useEffect(() => {
    handleTranslate(transSeqIdx);
  }, [transSeqIdx, records]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl bio-card space-y-6">
      {/* Header and Tool Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Bioinformatics Analysis Workbench</span>
            <span className="text-xs font-mono font-medium text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              In-Silico Tools
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pairwise Needleman-Wunsch Alignment, Identity Matrix, Reverse Complement & 6-Frame Translation.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("align")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "align"
                ? "bg-teal-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Pairwise Alignment
          </button>
          <button
            onClick={() => {
              setActiveTab("matrix");
              if (!matrixData) handleLoadMatrix();
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "matrix"
                ? "bg-teal-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Identity Matrix
          </button>
          <button
            onClick={() => setActiveTab("translate")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "translate"
                ? "bg-teal-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Translation & ORFs
          </button>
        </div>
      </div>

      {/* Tab 1: Pairwise Alignment */}
      {activeTab === "align" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sequence 1 (Target)
              </label>
              <select
                value={seq1Idx}
                onChange={(e) => setSeq1Idx(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-500"
              >
                {records.map((r, i) => (
                  <option key={i} value={i}>
                    {r.accession} ({r.analysis?.total_length || r.length} bp) - {r.title?.slice(0, 45)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sequence 2 (Query)
              </label>
              <select
                value={seq2Idx}
                onChange={(e) => setSeq2Idx(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-500"
              >
                {records.map((r, i) => (
                  <option key={i} value={i}>
                    {r.accession} ({r.analysis?.total_length || r.length} bp) - {r.title?.slice(0, 45)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                onClick={handleRunAlignment}
                disabled={isAligning}
                className="w-full py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                {isAligning ? "Aligning..." : "Run Alignment"}
              </button>
            </div>
          </div>

          {/* Alignment Output */}
          {alignResult && (
            <div className="mt-4 bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Percentage Identity</div>
                  <div className="text-base font-bold font-mono text-teal-300">
                    {alignResult.identity_percentage}%
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Alignment Score</div>
                  <div className="text-base font-bold font-mono text-white">
                    {alignResult.score}
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Matches (|)</div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {alignResult.matches}
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Mismatches (.)</div>
                  <div className="text-base font-bold font-mono text-red-400">
                    {alignResult.mismatches}
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Gaps (-)</div>
                  <div className="text-base font-bold font-mono text-amber-400">
                    {alignResult.gaps}
                  </div>
                </div>
              </div>

              {/* Formatted Alignment Block */}
              <div className="overflow-x-auto p-3 bg-slate-900/90 rounded-lg border border-slate-800 font-mono text-[11px] leading-tight select-text max-h-60 overflow-y-auto">
                <div className="text-teal-400 font-bold mb-1">
                  Query 1: {alignResult.acc1} vs Query 2: {alignResult.acc2}
                </div>
                <div className="text-slate-400 whitespace-pre">
                  Seq1: {alignResult.aligned_seq1}
                </div>
                <div className="text-teal-400 whitespace-pre">
                  Cons: {alignResult.match_line}
                </div>
                <div className="text-slate-400 whitespace-pre">
                  Seq2: {alignResult.aligned_seq2}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Identity Matrix */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pairwise sequence identity matrix (%) across all retrieved records.</span>
            <button
              onClick={handleLoadMatrix}
              disabled={isMatrixLoading}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 transition"
            >
              {isMatrixLoading ? "Computing..." : "Recalculate Matrix"}
            </button>
          </div>

          {matrixData && (
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border border-slate-800 font-mono">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="p-2 border border-slate-800 text-left">Record</th>
                    {matrixData.accessions.map((acc, i) => (
                      <th key={i} className="p-2 border border-slate-800">
                        {acc}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.matrix.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="p-2 border border-slate-800 font-semibold text-left text-teal-300">
                        {matrixData.accessions[i]}
                      </td>
                      {row.map((val, j) => {
                        let bg = "bg-slate-950 text-slate-400";
                        if (val === 100) bg = "bg-teal-500/20 text-teal-300 font-bold";
                        else if (val >= 90) bg = "bg-emerald-500/20 text-emerald-300";
                        else if (val >= 70) bg = "bg-cyan-500/20 text-cyan-300";
                        else if (val >= 50) bg = "bg-amber-500/20 text-amber-300";

                        return (
                          <td key={j} className={`p-2 border border-slate-800 ${bg}`}>
                            {val}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Translation & Reverse Complement */}
      {activeTab === "translate" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <label className="text-xs font-semibold text-slate-300">
              Select Record to Translate:
            </label>
            <select
              value={transSeqIdx}
              onChange={(e) => setTransSeqIdx(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-500"
            >
              {records.map((r, i) => (
                <option key={i} value={i}>
                  {r.accession} ({r.analysis?.total_length || r.length} bp)
                </option>
              ))}
            </select>
          </div>

          {transResult && (
            <div className="space-y-4">
              {/* Reverse Complement Display */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-teal-400 font-semibold mb-1">
                  <span>5' to 3' Reverse Complement Strand</span>
                  <span className="font-mono text-slate-400 text-[10px]">{transResult.dna_length} bp</span>
                </div>
                <div className="font-mono text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg max-h-24 overflow-y-auto break-all select-text">
                  {transResult.reverse_complement}
                </div>
              </div>

              {/* In-silico Reading Frames (6 Frames) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-teal-400 font-semibold mb-2">
                  In-Silico 6-Frame Protein Translation
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  {Object.entries(transResult.translations || {}).map(([frame, aaSeq]) => (
                    <div key={frame} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-slate-400 font-bold mb-1 text-[11px]">Frame {frame}:</div>
                      <div className="text-cyan-300 break-all max-h-20 overflow-y-auto select-text text-[10px]">
                        {aaSeq}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identified Open Reading Frames (ORFs) */}
              {transResult.orfs && transResult.orfs.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-teal-400 font-semibold mb-2">
                    <span>Identified Candidate Open Reading Frames (ORFs)</span>
                    <span className="text-[10px] text-slate-400">Sorted by amino acid length</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                        <tr>
                          <th className="p-2">Frame</th>
                          <th className="p-2">Start - End</th>
                          <th className="p-2">Length (nt)</th>
                          <th className="p-2">Length (aa)</th>
                          <th className="p-2">Translated Protein (preview)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {transResult.orfs.map((orf, i) => (
                          <tr key={i} className="hover:bg-slate-900/50">
                            <td className="p-2 text-teal-300 font-bold">{orf.strand} F{orf.frame}</td>
                            <td className="p-2">{orf.start}..{orf.end}</td>
                            <td className="p-2">{orf.length_nt} bp</td>
                            <td className="p-2 font-bold text-white">{orf.length_aa} aa</td>
                            <td className="p-2 text-cyan-300 text-[10px] truncate max-w-xs" title={orf.protein}>
                              {orf.protein.slice(0, 35)}...
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

