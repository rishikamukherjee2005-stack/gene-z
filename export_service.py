"""
Export Service for GeneZ.
Generates FASTA files, formatted CSV analysis spreadsheets, and JSON reports
for download and downstream bioinformatics pipelines.
"""

import io
import csv
import json
from typing import List, Dict, Any

def generate_multi_fasta(records: List[Dict[str, Any]]) -> str:
    """
    Generate a formatted multi-FASTA string from all retrieved records.
    """
    fasta_lines = []
    for rec in records:
        fasta_str = rec.get("fasta", "").strip()
        if fasta_str:
            fasta_lines.append(fasta_str)
        else:
            # Fallback construct if fasta attribute was empty
            acc = rec.get("accession", "unknown")
            title = rec.get("title", "")
            seq = rec.get("analysis", {}).get("full_cleaned_sequence", "")
            # Wrap at 60 chars per line standard FASTA
            wrapped = "\n".join([seq[i:i+60] for i in range(0, len(seq), 60)])
            fasta_lines.append(f">{acc} {title}\n{wrapped}")
            
    return "\n\n".join(fasta_lines)

def generate_csv_report(records: List[Dict[str, Any]]) -> str:
    """
    Generate a detailed CSV analysis report containing all sequence metrics.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Header Row
    headers = [
        "Accession",
        "Organism",
        "Gene",
        "Title",
        "Molecule Type",
        "Length (bp)",
        "Count A",
        "Count T",
        "Count G",
        "Count C",
        "Count Ambiguous",
        "A (%)",
        "T (%)",
        "G (%)",
        "C (%)",
        "GC Content (%)",
        "AT Content (%)",
        "Ambiguous (%)",
        "Purine Count (A+G)",
        "Pyrimidine Count (C+T)",
        "Purine/Pyrimidine Ratio",
        "CpG Dinucleotides",
        "Estimated Tm (°C)",
        "Estimated MW (kDa)",
        "NCBI URL"
    ]
    writer.writerow(headers)

    for rec in records:
        analysis = rec.get("analysis", {})
        counts = analysis.get("counts", {})
        pcts = analysis.get("percentages", {})
        bio = analysis.get("biochemical_metrics", {})

        row = [
            rec.get("accession", ""),
            rec.get("organism", ""),
            rec.get("gene", ""),
            rec.get("title", ""),
            rec.get("molecule_type", ""),
            analysis.get("total_length", 0),
            counts.get("A", 0),
            counts.get("T", 0),
            counts.get("G", 0),
            counts.get("C", 0),
            counts.get("ambiguous", 0),
            pcts.get("A", 0.0),
            pcts.get("T", 0.0),
            pcts.get("G", 0.0),
            pcts.get("C", 0.0),
            pcts.get("GC", 0.0),
            pcts.get("AT", 0.0),
            pcts.get("ambiguous", 0.0),
            bio.get("purines", 0),
            bio.get("pyrimidines", 0),
            bio.get("purine_pyrimidine_ratio", "N/A"),
            bio.get("cpg_islands_count", 0),
            bio.get("melting_temperature_c", "N/A"),
            bio.get("molecular_weight_kda", "N/A"),
            rec.get("ncbi_url", "")
        ]
        writer.writerow(row)

    return output.getvalue()

