// GeneZ Comparative Analysis & Chart.js Visualization Component
window.ComparativeSection = function({ comparativeData, records }) {
  if (!comparativeData || !comparativeData.comparison_table || comparativeData.comparison_table.length === 0) {
    return null;
  }

  const chartLengthRef = React.useRef(null);
  const chartGcRef = React.useRef(null);
  const chartBasesRef = React.useRef(null);

  const lengthChartInstance = React.useRef(null);
  const gcChartInstance = React.useRef(null);
  const basesChartInstance = React.useRef(null);

  const [activeChartTab, setActiveChartTab] = React.useState("length"); // 'length', 'gc', 'bases'

  // Initialize and update Chart.js instances
  React.useEffect(() => {
    if (typeof Chart === "undefined") return;

    const chartData = comparativeData.chart_data || {};
    const table = comparativeData.comparison_table || [];

    // Common Chart.js styling options for dark navy theme
    const commonScales = {
      x: {
        grid: { color: "rgba(30, 58, 95, 0.4)" },
        ticks: { color: "#94a3b8", font: { family: "JetBrains Mono", size: 11 } }
      },
      y: {
        grid: { color: "rgba(30, 58, 95, 0.4)" },
        ticks: { color: "#94a3b8", font: { family: "JetBrains Mono", size: 11 } }
      }
    };

    // Chart 1: Length Comparison
    if (chartLengthRef.current) {
      if (lengthChartInstance.current) lengthChartInstance.current.destroy();

      const lengthConfig = chartData.length_comparison || {
        labels: table.map((r) => r.accession),
        datasets: [
          {
            label: "Sequence Length (bp)",
            data: table.map((r) => r.length),
            backgroundColor: "rgba(20, 184, 166, 0.75)",
            borderColor: "rgb(13, 148, 136)",
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      };

      lengthChartInstance.current = new Chart(chartLengthRef.current, {
        type: "bar",
        data: lengthConfig,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#e2e8f0", font: { family: "Inter", size: 12 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => `Length: ${ctx.parsed.y.toLocaleString()} bp`
              }
            }
          },
          scales: commonScales
        }
      });
    }

    // Chart 2: GC vs AT Comparison
    if (chartGcRef.current) {
      if (gcChartInstance.current) gcChartInstance.current.destroy();

      const gcConfig = chartData.gc_at_comparison || {
        labels: table.map((r) => r.accession),
        datasets: [
          {
            label: "GC Content (%)",
            data: table.map((r) => r.gc_percent),
            backgroundColor: "rgba(14, 165, 233, 0.8)",
            borderRadius: 6
          },
          {
            label: "AT Content (%)",
            data: table.map((r) => r.at_percent),
            backgroundColor: "rgba(249, 115, 22, 0.8)",
            borderRadius: 6
          }
        ]
      };

      gcChartInstance.current = new Chart(chartGcRef.current, {
        type: "bar",
        data: gcConfig,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#e2e8f0", font: { family: "Inter", size: 12 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`
              }
            }
          },
          scales: {
            ...commonScales,
            y: { ...commonScales.y, max: 100 }
          }
        }
      });
    }

    // Chart 3: Nucleotide Distribution (A, T, G, C)
    if (chartBasesRef.current) {
      if (basesChartInstance.current) basesChartInstance.current.destroy();

      const basesConfig = chartData.nucleotide_distribution || {
        labels: table.map((r) => r.accession),
        datasets: [
          {
            label: "Adenine (A %)",
            data: table.map((r) => r.percentages?.A || 0),
            backgroundColor: "rgba(34, 197, 94, 0.8)",
            borderRadius: 4
          },
          {
            label: "Thymine (T %)",
            data: table.map((r) => r.percentages?.T || 0),
            backgroundColor: "rgba(239, 68, 68, 0.8)",
            borderRadius: 4
          },
          {
            label: "Guanine (G %)",
            data: table.map((r) => r.percentages?.G || 0),
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderRadius: 4
          },
          {
            label: "Cytosine (C %)",
            data: table.map((r) => r.percentages?.C || 0),
            backgroundColor: "rgba(234, 179, 8, 0.8)",
            borderRadius: 4
          }
        ]
      };

      basesChartInstance.current = new Chart(chartBasesRef.current, {
        type: "bar",
        data: basesConfig,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#e2e8f0", font: { family: "Inter", size: 12 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`
              }
            }
          },
          scales: {
            ...commonScales,
            y: { ...commonScales.y, max: 100 }
          }
        }
      });
    }

    return () => {
      if (lengthChartInstance.current) lengthChartInstance.current.destroy();
      if (gcChartInstance.current) gcChartInstance.current.destroy();
      if (basesChartInstance.current) basesChartInstance.current.destroy();
    };
  }, [comparativeData, activeChartTab]);

  const observations = comparativeData.observations || [];
  const table = comparativeData.comparison_table || [];

  return (
    <div className="space-y-6">
      {/* Comparative Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl bio-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Comparative Sequence Matrix</span>
              <span className="text-xs font-mono font-medium text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                {table.length} sequences
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side nucleotide composition, thermodynamic stability, and physical attributes.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase font-semibold text-slate-400 bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Accession</th>
                <th className="py-3 px-3 text-right">Length (bp)</th>
                <th className="py-3 px-3 text-right">GC %</th>
                <th className="py-3 px-3 text-right">AT %</th>
                <th className="py-3 px-3 text-center">Nucleotide Breakdown (A | T | G | C)</th>
                <th className="py-3 px-3 text-right">Ambiguous</th>
                <th className="py-3 px-3 text-right">Est. Tm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {table.map((row, idx) => {
                const c = row.counts || {};
                const p = row.percentages || {};

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-semibold text-teal-300 whitespace-nowrap">
                      {row.accession}
                    </td>
                    <td className="py-3 px-3 font-mono text-right font-bold text-white whitespace-nowrap">
                      {row.length?.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-right font-bold text-cyan-400 whitespace-nowrap">
                      {row.gc_percent}%
                    </td>
                    <td className="py-3 px-3 font-mono text-right font-bold text-amber-400 whitespace-nowrap">
                      {row.at_percent}%
                    </td>
                    <td className="py-3 px-3 font-mono text-center whitespace-nowrap">
                      <span className="text-emerald-400 font-bold">{c.A}</span>
                      <span className="text-slate-600 mx-1">|</span>
                      <span className="text-red-400 font-bold">{c.T}</span>
                      <span className="text-slate-600 mx-1">|</span>
                      <span className="text-blue-400 font-bold">{c.G}</span>
                      <span className="text-slate-600 mx-1">|</span>
                      <span className="text-yellow-400 font-bold">{c.C}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-right whitespace-nowrap">
                      {row.ambiguous_percent > 0 ? (
                        <span className="text-purple-400 font-semibold">{c.ambiguous} ({row.ambiguous_percent}%)</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-right text-slate-200 whitespace-nowrap">
                      {row.melting_temperature_c ? `${row.melting_temperature_c} °C` : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart.js Comparative Graphs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl bio-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Comparative Data Visualizations</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive Chart.js plots comparing sequence metrics across retrieved records.
            </p>
          </div>

          {/* Graph Selector Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab("length")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeChartTab === "length"
                  ? "bg-teal-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sequence Lengths
            </button>
            <button
              onClick={() => setActiveChartTab("gc")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeChartTab === "gc"
                  ? "bg-teal-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              GC vs AT Content
            </button>
            <button
              onClick={() => setActiveChartTab("bases")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeChartTab === "bases"
                  ? "bg-teal-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Nucleotide Distribution
            </button>
          </div>
        </div>

        {/* Canvas Containers */}
        <div className="h-72 w-full pt-2">
          <div className={`h-full w-full ${activeChartTab === "length" ? "block" : "hidden"}`}>
            <canvas ref={chartLengthRef}></canvas>
          </div>
          <div className={`h-full w-full ${activeChartTab === "gc" ? "block" : "hidden"}`}>
            <canvas ref={chartGcRef}></canvas>
          </div>
          <div className={`h-full w-full ${activeChartTab === "bases" ? "block" : "hidden"}`}>
            <canvas ref={chartBasesRef}></canvas>
          </div>
        </div>
      </div>

      {/* Automated Scientific Observations Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl bio-card">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-800">
          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-base font-bold text-white">
            Automated Bioinformatic Observations
          </h2>
        </div>

        {/* Observation Bullet Points */}
        <div className="space-y-3">
          {observations.map((obs, idx) => (
            <div key={idx} className="flex items-start space-x-3 text-xs text-slate-200 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{obs}</p>
            </div>
          ))}
        </div>

        {/* Crucial Scientific Disclaimer Banner */}
        <div className="mt-5 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start space-x-3 text-amber-200/90 text-xs">
          <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-semibold text-amber-300">Methodological Rigor Notice:</span>{" "}
            {comparativeData.disclaimer ||
              "These observations are derived strictly from compositional metrics and physical lengths. No claims regarding sequence homology or evolutionary relationships can be made without sequence alignment analysis (e.g. BLASTn, Clustal Omega)."}
          </div>
        </div>
      </div>
    </div>
  );
};

