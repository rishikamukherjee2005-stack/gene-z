// GeneZ Main React Application Root Component
function GeneZApp() {
  const [organism, setOrganism] = React.useState("");
  const [gene, setGene] = React.useState("");
  const [maxRecords, setMaxRecords] = React.useState(3);

  const [data, setData] = React.useState(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isSearching, setIsSearching] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = React.useState(false);
  const [apiKey, setApiKey] = React.useState(localStorage.getItem("genez_gemini_key") || "");
  const [isGeminiConfigured, setIsGeminiConfigured] = React.useState(false);

  // Check health on mount without performing any automatic search
  React.useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((resData) => {
        setIsGeminiConfigured(resData.gemini_configured || !!apiKey);
      })
      .catch((err) => {
        console.warn("Health check error:", err);
      });
  }, []);

  // Main search function
  const performSearch = async (targetOrg, targetGene, targetMax) => {
    const orgQuery = targetOrg || organism;
    const geneQuery = targetGene || gene;
    const maxQuery = targetMax || maxRecords;

    if (!orgQuery.trim() || !geneQuery.trim()) {
      setErrorMessage("Please enter both Organism and Gene names.");
      return;
    }

    setIsSearching(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organism: orgQuery.trim(),
          gene: geneQuery.trim(),
          max_records: maxQuery
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setData(result);
        setActiveIndex(0);
      } else {
        setErrorMessage(result.error || "Failed to retrieve records from NCBI.");
      }
    } catch (err) {
      setErrorMessage(`Network error querying GeneZ backend: ${err.message}. Please check that the server is running.`);
    } finally {
      setIsSearching(false);
    }
  };

  // Custom FASTA sequence submission
  const handleCustomAnalyze = async (fasta, customOrg, customGene) => {
    setIsSearching(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/analyze-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fasta: fasta,
          organism: customOrg,
          gene: customGene
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setData({
          success: true,
          organism: customOrg,
          gene: customGene,
          source: "custom_input",
          note: "Custom sequence analyzed via local Python bioinformatics engine.",
          record_count: 1,
          records: [result.record],
          comparative: result.comparative
        });
        setActiveIndex(0);
      } else {
        setErrorMessage(result.error || "Could not parse or analyze sequence.");
      }
    } catch (err) {
      setErrorMessage(`Analysis error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Quick preset loader
  const handleSelectPreset = (pOrg, pGene) => {
    setOrganism(pOrg);
    setGene(pGene);
    performSearch(pOrg, pGene, maxRecords);
  };

  // Export Multi-FASTA
  const handleExportFasta = async () => {
    if (!data || !data.records) return;
    try {
      const response = await fetch("/api/export/fasta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: data.records,
          gene: data.gene || "sequences"
        })
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GeneZ_${data.gene}_sequences.fasta`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export error: ${err.message}`);
    }
  };

  // Export CSV Report
  const handleExportCsv = async () => {
    if (!data || !data.records) return;
    try {
      const response = await fetch("/api/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: data.records,
          gene: data.gene || "analysis"
        })
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GeneZ_${data.gene}_analysis_report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export error: ${err.message}`);
    }
  };

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem("genez_gemini_key", newKey);
    setIsGeminiConfigured(!!newKey);
  };

  const activeRecord = data && data.records && data.records[activeIndex] ? data.records[activeIndex] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Bar */}
      <window.Navbar
        onSelectPreset={handleSelectPreset}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        isGeminiConfigured={isGeminiConfigured}
        isSearching={isSearching}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Search & Input Workbench */}
        <window.SearchSection
          organism={organism}
          setOrganism={setOrganism}
          gene={gene}
          setGene={setGene}
          maxRecords={maxRecords}
          setMaxRecords={setMaxRecords}
          onSearch={() => performSearch(organism, gene, maxRecords)}
          onCustomAnalyze={handleCustomAnalyze}
          isSearching={isSearching}
          errorMessage={errorMessage}
        />

        {/* Initial Welcome / Prompt state before search */}
        {!data && !isSearching && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center space-y-4 bio-card max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ready for Sequence Retrieval</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Enter an organism name (e.g., <span className="text-teal-300 font-medium">Homo sapiens</span>) and gene symbol (e.g., <span className="text-teal-300 font-medium">TP53</span>) above, or pick a Quick Demo to begin analysis.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-slate-400 mr-1">Suggested Demos:</span>
              <button
                onClick={() => handleSelectPreset("Escherichia coli", "lacZ")}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-teal-300 hover:border-teal-500/50 transition"
              >
                E. coli - lacZ
              </button>
              <button
                onClick={() => handleSelectPreset("Homo sapiens", "TP53")}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-teal-300 hover:border-teal-500/50 transition"
              >
                H. sapiens - TP53
              </button>
              <button
                onClick={() => handleSelectPreset("Saccharomyces cerevisiae", "ACT1")}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-teal-300 hover:border-teal-500/50 transition"
              >
                S. cerevisiae - ACT1
              </button>
              <button
                onClick={() => handleSelectPreset("Arabidopsis thaliana", "rbcL")}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-teal-300 hover:border-teal-500/50 transition"
              >
                A. thaliana - rbcL
              </button>
            </div>
          </div>
        )}

        {/* Searching Skeleton / Progress Loader */}
        {isSearching && !data && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3 bio-card max-w-xl mx-auto">
            <div className="animate-spin w-10 h-10 border-4 border-teal-500/20 border-t-teal-400 rounded-full mx-auto"></div>
            <h3 className="text-sm font-bold text-white">Connecting to NCBI Entrez...</h3>
            <p className="text-xs text-slate-400">
              Retrieving nucleotide sequences, parsing FASTA headers, and computing compositional metrics.
            </p>
          </div>
        )}

        {/* Results Overview Metrics */}
        {data && (
          <window.ResultsOverview
            data={data}
            onExportFasta={handleExportFasta}
            onExportCsv={handleExportCsv}
          />
        )}

        {/* NCBI Sequence Sources Table */}
        {data && data.records && data.records.length > 0 && (
          <window.NcbiSourceTable
            records={data.records}
            activeIndex={activeIndex}
            onSelectIndex={(idx) => setActiveIndex(idx)}
          />
        )}

        {/* Detailed Inspection Grid: FASTA Viewer & Sequence Metrics */}
        {activeRecord && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <window.FastaViewer
              records={data.records}
              activeIndex={activeIndex}
              onSelectIndex={(idx) => setActiveIndex(idx)}
            />
            <window.SequenceMetrics record={activeRecord} />
          </div>
        )}

        {/* Comparative Analysis Section & Visualizations */}
        {data && data.comparative && (
          <window.ComparativeSection
            comparativeData={data.comparative}
            records={data.records}
          />
        )}

        {/* BioTools: Pairwise Alignment, Identity Matrix & 6-Frame Translation */}
        {data && data.records && data.records.length > 0 && (
          <window.BioToolsSection records={data.records} />
        )}

        {/* Integrated Gemini AI Assistant Section */}
        {data && (
          <window.GeminiChatbot
            organism={data.organism}
            gene={data.gene}
            records={data.records}
            comparativeData={data.comparative}
            apiKey={apiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-slate-300">GeneZ</span>
            <span>— AI-Powered Gene Sequence Retrieval & Analysis Platform</span>
          </div>
          <div>
            Powered by NCBI Entrez E-utilities, Biopython & Google Gemini AI
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <window.ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}

// Render React App to DOM
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<GeneZApp />);
}

