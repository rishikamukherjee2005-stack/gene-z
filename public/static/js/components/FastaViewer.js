// GeneZ FASTA Sequence Viewer Component
window.FastaViewer = function({ records, activeIndex, onSelectIndex }) {
  if (!records || records.length === 0) return null;

  const currentRecord = records[activeIndex] || records[0];
  const [copied, setCopied] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showColoredBases, setShowColoredBases] = React.useState(true);

  // Extract raw sequence without header
  const rawFasta = currentRecord.fasta || "";
  const lines = rawFasta.split("\n");
  const headerLine = lines[0] && lines[0].startsWith(">") ? lines[0] : `>${currentRecord.accession} ${currentRecord.title}`;
  const seqLines = lines[0] && lines[0].startsWith(">") ? lines.slice(1).join("") : rawFasta;
  const cleanSeq = seqLines.replace(/[^A-Za-z]/g, "").toUpperCase();

  // Break sequence into 60-character blocks for canonical FASTA formatting
  const formattedBlocks = React.useMemo(() => {
    const blocks = [];
    for (let i = 0; i < cleanSeq.length; i += 60) {
      blocks.push({
        start: i + 1,
        text: cleanSeq.slice(i, i + 60)
      });
    }
    return blocks;
  }, [cleanSeq]);

  const handleCopyFasta = () => {
    const fullText = `${headerLine}\n${cleanSeq}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleDownloadSingleFasta = () => {
    const fullText = `${headerLine}\n${cleanSeq.match(/.{1,60}/g)?.join("\n") || cleanSeq}`;
    const blob = new Blob([fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentRecord.accession}_sequence.fasta`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to render bases with color
  const renderColoredBases = (text) => {
    if (!showColoredBases) return text;

    return text.split("").map((ch, i) => {
      let colorClass = "text-slate-300";
      if (ch === "A") colorClass = "base-a";
      else if (ch === "T" || ch === "U") colorClass = "base-t";
      else if (ch === "G") colorClass = "base-g";
      else if (ch === "C") colorClass = "base-c";
      else colorClass = "base-ambiguous";

      return (
        <span key={i} className={colorClass}>
          {ch}
        </span>
      );
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl bio-card">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>FASTA Sequence Explorer</span>
            <span className="text-xs font-mono font-medium text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              {cleanSeq.length.toLocaleString()} bp
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono truncate max-w-xl mt-0.5">
            {headerLine}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Color Toggle */}
          <button
            onClick={() => setShowColoredBases(!showColoredBases)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showColoredBases
                ? "bg-teal-500/15 border-teal-500/40 text-teal-300"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
            }`}
            title="Toggle Base Syntax Highlighting"
          >
            {showColoredBases ? "Colors: ON" : "Colors: OFF"}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyFasta}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 hover:text-teal-300 transition flex items-center space-x-1.5"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copy FASTA</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownloadSingleFasta}
            className="px-3.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-xs font-semibold text-teal-300 transition flex items-center space-x-1.5"
            title="Download this FASTA sequence"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download .fasta</span>
          </button>
        </div>
      </div>

      {/* Record Selection Tabs */}
      {records.length > 1 && (
        <div className="flex space-x-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-800/80">
          {records.map((r, i) => (
            <button
              key={i}
              onClick={() => onSelectIndex(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap ${
                i === activeIndex
                  ? "bg-teal-500 text-slate-950 font-bold shadow"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {r.accession} ({r.analysis?.total_length || r.length} bp)
            </button>
          ))}
        </div>
      )}

      {/* Motif Search within sequence */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Search Motif:</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            placeholder="e.g. ATG, TATA, GAATTC"
            className="bg-slate-950 border border-slate-700/80 rounded-md px-2 py-1 text-xs font-mono text-teal-300 placeholder-slate-600 focus:outline-none focus:border-teal-500 w-36 uppercase"
          />
          {searchTerm && (
            <span className="text-[11px] text-teal-300 font-mono">
              Matches: {(cleanSeq.match(new RegExp(searchTerm, "g")) || []).length}
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center space-x-3 text-[11px] font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400">A</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="text-red-400">T</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-blue-400">G</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span className="text-yellow-400">C</span>
          </span>
        </div>
      </div>

      {/* FASTA Monospace Sequence Area */}
      <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4 max-h-80 overflow-y-auto font-dna text-xs leading-relaxed select-text shadow-inner">
        {/* FASTA Header Line */}
        <div className="text-teal-400 font-bold mb-2 pb-1 border-b border-slate-800/80 select-all">
          {headerLine}
        </div>

        {/* Sequence Blocks with Coordinate Numbers */}
        <div className="space-y-1">
          {formattedBlocks.map((block, idx) => (
            <div key={idx} className="flex items-start">
              <span className="fasta-line-number text-slate-500 font-mono select-none">
                {block.start}
              </span>
              <span className="pl-3 tracking-widest break-all font-mono">
                {renderColoredBases(block.text)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

