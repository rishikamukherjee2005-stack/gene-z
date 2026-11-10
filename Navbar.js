// GeneZ Navbar Component
window.Navbar = function({ onSelectPreset, onOpenApiKeyModal, isGeminiConfigured, isSearching }) {
  const presets = [
    { label: "E. coli - lacZ", organism: "Escherichia coli", gene: "lacZ" },
    { label: "H. sapiens - TP53", organism: "Homo sapiens", gene: "TP53" },
    { label: "S. cerevisiae - ACT1", organism: "Saccharomyces cerevisiae", gene: "ACT1" },
    { label: "A. thaliana - rbcL", organism: "Arabidopsis thaliana", gene: "rbcL" }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                Gene<span className="text-teal-400">Z</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                v1.0 BioAI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              NCBI Sequence Retrieval & Gemini AI Analysis Platform
            </p>
          </div>
        </div>

        {/* Preset Gene Pills for Quick Demo */}
        <div className="hidden lg:flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Quick Demos:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPreset(p.organism, p.gene)}
              disabled={isSearching}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-teal-300 hover:border-teal-500/50 hover:bg-slate-800 transition disabled:opacity-50"
              title={`Load ${p.organism} ${p.gene}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center space-x-3">
          {/* Gemini AI Status Badge */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
              isGeminiConfigured
                ? "bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
            }`}
            title="Configure Gemini API Key"
          >
            <span className={`w-2 h-2 rounded-full ${isGeminiConfigured ? "bg-teal-400" : "bg-amber-400"}`}></span>
            <span className="font-medium">
              {isGeminiConfigured ? "Gemini AI: Active" : "Gemini AI: Educational Mode"}
            </span>
            <svg className="w-3.5 h-3.5 ml-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

