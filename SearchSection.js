// GeneZ Search Section Component
window.SearchSection = function({
  organism,
  setOrganism,
  gene,
  setGene,
  maxRecords,
  setMaxRecords,
  onSearch,
  onCustomAnalyze,
  isSearching,
  errorMessage
}) {
  const [activeTab, setActiveTab] = React.useState("ncbi"); // 'ncbi' or 'custom'
  const [customFasta, setCustomFasta] = React.useState("");

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customFasta.trim()) return;
    onCustomAnalyze(customFasta, organism || "Custom Sample", gene || "Synthetic");
  };

  const handleNcbiSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>NCBI Sequence Retrieval & Biological Workbench</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Retrieve genuine nucleotide and mRNA records via NCBI Entrez E-utilities and calculate DNA composition metrics.
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("ncbi")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "ncbi"
                ? "bg-teal-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            NCBI Entrez Search
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "custom"
                ? "bg-teal-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Custom FASTA
          </button>
        </div>
      </div>

      {/* Error Message Box if search failed */}
      {errorMessage && (
        <div className="mb-6 bg-red-950/40 border border-red-500/40 rounded-xl p-4 flex items-start space-x-3 text-red-200 text-sm">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-semibold text-red-300">Retrieval Notice:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* NCBI Search Form */}
      {activeTab === "ncbi" ? (
        <form onSubmit={handleNcbiSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Organism Name Input */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Organism Name <span className="text-teal-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={organism}
                  onChange={(e) => setOrganism(e.target.value)}
                  placeholder="e.g. Escherichia coli or Homo sapiens"
                  required
                  disabled={isSearching}
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            {/* Gene Name Input */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Gene / Locus Symbol <span className="text-teal-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={gene}
                  onChange={(e) => setGene(e.target.value)}
                  placeholder="e.g. lacZ or TP53"
                  required
                  disabled={isSearching}
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            {/* Max Records Selector */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Records: <span className="text-teal-400 font-mono">{maxRecords}</span>
              </label>
              <select
                value={maxRecords}
                onChange={(e) => setMaxRecords(Number(e.target.value))}
                disabled={isSearching}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
              >
                <option value="2">2 Records (Quick)</option>
                <option value="3">3 Records (Recommended)</option>
                <option value="4">4 Records</option>
                <option value="5">5 Records</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
            <div className="text-xs text-slate-400 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span>Queries NCBI Nucleotide Database (nuccore) via E-utilities REST</span>
            </div>

            <button
              type="submit"
              disabled={isSearching || !organism.trim() || !gene.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Querying NCBI Entrez...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Retrieve & Analyze Sequence</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Custom FASTA Form */
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Paste FASTA Format Nucleotide Sequence
            </label>
            <textarea
              rows="5"
              value={customFasta}
              onChange={(e) => setCustomFasta(e.target.value)}
              placeholder=">Sample_Seq_01 Custom nucleotide sequence&#10;ATGCGTACGTAGCTAGCTAGCGCTAGCTAGCTA..."
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSearching || !customFasta.trim()}
              className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center space-x-2 transition disabled:opacity-50"
            >
              <span>Analyze Custom FASTA</span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

