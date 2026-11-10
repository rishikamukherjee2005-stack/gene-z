"""
Comparative DNA Sequence Analysis Service for GeneZ.
Generates comparison matrices, Chart.js payload structures, and objective,
scientifically sound observations without unsubstantiated homology claims.
"""

from typing import List, Dict, Any

def generate_comparative_analysis(analyzed_records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compiles comparative metrics and observations across retrieved gene sequences.
    """
    if not analyzed_records:
        return {
            "comparison_table": [],
            "chart_data": {},
            "summary_stats": {},
            "observations": ["No sequence records available for comparison."],
            "disclaimer": "No sequence alignment performed."
        }

    comparison_table = []
    lengths = []
    gc_percentages = []
    at_percentages = []
    accessions = []
    labels = []

    for idx, rec in enumerate(analyzed_records):
        analysis = rec.get("analysis", {})
        acc = rec.get("accession", f"Rec-{idx+1}")
        title = rec.get("title", "Untitled")
        tot_len = analysis.get("total_length", 0)
        pcts = analysis.get("percentages", {})
        counts = analysis.get("counts", {})
        bio_metrics = analysis.get("biochemical_metrics", {})

        accessions.append(acc)
        labels.append(f"{acc} ({tot_len} bp)")
        lengths.append(tot_len)
        gc_percentages.append(pcts.get("GC", 0.0))
        at_percentages.append(pcts.get("AT", 0.0))

        comparison_table.append({
            "accession": acc,
            "title": title,
            "molecule_type": rec.get("molecule_type", "DNA"),
            "organism": rec.get("organism", "Unknown"),
            "length": tot_len,
            "gc_percent": pcts.get("GC", 0.0),
            "at_percent": pcts.get("AT", 0.0),
            "ambiguous_percent": pcts.get("ambiguous", 0.0),
            "counts": counts,
            "percentages": pcts,
            "melting_temperature_c": bio_metrics.get("melting_temperature_c", None),
            "molecular_weight_kda": bio_metrics.get("molecular_weight_kda", None),
            "cpg_count": bio_metrics.get("cpg_islands_count", 0),
            "ncbi_url": rec.get("ncbi_url", "")
        })

    # Summary Statistics
    min_len = min(lengths) if lengths else 0
    max_len = max(lengths) if lengths else 0
    avg_len = round(sum(lengths) / len(lengths), 1) if lengths else 0

    min_gc = min(gc_percentages) if gc_percentages else 0.0
    max_gc = max(gc_percentages) if gc_percentages else 0.0
    avg_gc = round(sum(gc_percentages) / len(gc_percentages), 2) if gc_percentages else 0.0

    min_at = min(at_percentages) if at_percentages else 0.0
    max_at = max(at_percentages) if at_percentages else 0.0
    avg_at = round(sum(at_percentages) / len(at_percentages), 2) if at_percentages else 0.0

    summary_stats = {
        "record_count": len(analyzed_records),
        "length": {"min": min_len, "max": max_len, "avg": avg_len, "delta": max_len - min_len},
        "gc": {"min": min_gc, "max": max_gc, "avg": avg_gc, "delta": round(max_gc - min_gc, 2)},
        "at": {"min": min_at, "max": max_at, "avg": avg_at, "delta": round(max_at - min_at, 2)}
    }

    # Chart.js Ready Payloads
    chart_data = {
        "length_comparison": {
            "labels": accessions,
            "datasets": [
                {
                    "label": "Sequence Length (bp)",
                    "data": lengths,
                    "backgroundColor": "rgba(20, 184, 166, 0.7)",  # Teal
                    "borderColor": "rgb(13, 148, 136)",
                    "borderWidth": 1.5
                }
            ]
        },
        "gc_at_comparison": {
            "labels": accessions,
            "datasets": [
                {
                    "label": "GC Content (%)",
                    "data": gc_percentages,
                    "backgroundColor": "rgba(14, 165, 233, 0.8)",  # Sky Blue
                    "borderColor": "rgb(2, 132, 199)",
                    "borderWidth": 1
                },
                {
                    "label": "AT Content (%)",
                    "data": at_percentages,
                    "backgroundColor": "rgba(249, 115, 22, 0.8)",  # Orange/Amber
                    "borderColor": "rgb(234, 88, 12)",
                    "borderWidth": 1
                }
            ]
        },
        "nucleotide_distribution": {
            "labels": accessions,
            "datasets": [
                {
                    "label": "Adenine (A %)",
                    "data": [rec.get("analysis", {}).get("percentages", {}).get("A", 0) for rec in analyzed_records],
                    "backgroundColor": "rgba(34, 197, 94, 0.75)"  # Green
                },
                {
                    "label": "Thymine (T %)",
                    "data": [rec.get("analysis", {}).get("percentages", {}).get("T", 0) for rec in analyzed_records],
                    "backgroundColor": "rgba(239, 68, 68, 0.75)"  # Red
                },
                {
                    "label": "Guanine (G %)",
                    "data": [rec.get("analysis", {}).get("percentages", {}).get("G", 0) for rec in analyzed_records],
                    "backgroundColor": "rgba(59, 130, 246, 0.75)"  # Blue
                },
                {
                    "label": "Cytosine (C %)",
                    "data": [rec.get("analysis", {}).get("percentages", {}).get("C", 0) for rec in analyzed_records],
                    "backgroundColor": "rgba(234, 179, 8, 0.75)"  # Yellow
                }
            ]
        }
    }

    # Generate Objective Scientific Observations
    observations = []

    # 1. Length Observations
    if max_len == min_len:
        observations.append(
            f"All {len(analyzed_records)} retrieved sequence records exhibit identical nucleotide lengths ({min_len} bp), "
            f"indicative of equivalent complete coding sequences (CDS) or identical transcript isoforms."
        )
    elif max_len > min_len * 2:
        observations.append(
            f"Substantial sequence length disparity detected: sequences range from {min_len} bp to {max_len} bp "
            f"(a difference of {max_len - min_len} bp). The shorter records likely represent partial transcripts, "
            f"amplified PCR fragments, or single exons/regulatory motifs, while the longer records represent full-length mRNAs or genomic loci."
        )
    else:
        observations.append(
            f"Moderate length variation observed ({min_len} bp to {max_len} bp, delta: {max_len - min_len} bp), "
            f"reflecting potential alternate splicing isoforms, untranslated region (UTR) extensions, or differing sequencing boundaries."
        )

    # 2. GC Content Observations
    gc_delta = max_gc - min_gc
    if gc_delta < 2.0:
        observations.append(
            f"GC content is highly uniform across all retrieved sequences (mean GC: {avg_gc}%, span: {min_gc}% to {max_gc}%). "
            f"This consistent GC ratio reflects homogenous genomic background composition and consistent thermal denaturation kinetics."
        )
    else:
        observations.append(
            f"Noticeable GC content variation observed (span of {gc_delta}% between {min_gc}% and {max_gc}%). "
            f"Variation in GC percentage can occur between coding exons and flanking introns/UTRs, or between distinct genomic strains and isochores."
        )

    # 3. GC Stability Interpretation
    if avg_gc > 60.0:
        observations.append(
            f"High overall GC content ({avg_gc}%): Sequences enriched in G-C base pairs possess elevated thermodynamic stability "
            f"due to three inter-strand hydrogen bonds and base-stacking interactions, resulting in higher predicted melting temperatures."
        )
    elif avg_gc < 40.0:
        observations.append(
            f"AT-rich composition ({avg_at}% AT / {avg_gc}% GC): Lower GC content corresponds to reduced thermal denaturation resistance "
            f"and is frequently characteristic of AT-rich promoter domains, mitochondrial genomes, or specific eukaryotic taxa."
        )
    else:
        observations.append(
            f"Balanced nucleotide distribution ({avg_gc}% GC / {avg_at}% AT): Falls within standard canonical coding ranges "
            f"for cellular mRNAs and chromosomal genes."
        )

    # 4. Ambiguous Nucleotides Observation
    records_with_ambiguous = [r for r in comparison_table if r["ambiguous_percent"] > 0]
    if records_with_ambiguous:
        names = ", ".join([r["accession"] for r in records_with_ambiguous])
        observations.append(
            f"Ambiguous or non-canonical nucleotide codes detected in records: {names}. "
            f"These indicate either Sanger chromatogram base-calling uncertainty, IUPAC degenerate primer design positions, or polymorphic sites."
        )
    else:
        observations.append(
            "100% of analyzed records contain solely canonical (A, T, G, C) bases with zero ambiguous IUPAC characters, "
            "indicating high-confidence Sanger or next-generation sequencing curation."
        )

    disclaimer = (
        "Scientific Notice: Comparative observations are strictly based on compositional metrics, nucleotide frequencies, "
        "and physical lengths. True sequence similarity, homology, orthology, evolutionary conservation, or mutational divergence "
        "cannot be determined without pairwise or multiple sequence alignment (e.g. BLASTn, Smith-Waterman, or Clustal Omega)."
    )

    return {
        "comparison_table": comparison_table,
        "chart_data": chart_data,
        "summary_stats": summary_stats,
        "observations": observations,
        "disclaimer": disclaimer
    }
