"""
DNA Sequence Analyzer Service for GeneZ.
Performs rigorous sequence validation, nucleotide counting, GC/AT calculations,
ambiguous nucleotide resolution, and thermodynamic/biochemical estimations.
"""

import re
from typing import Dict, Any, List

# Standard IUPAC ambiguous nucleotide codes mapping
IUPAC_AMBIGUOUS_CODES = {
    'N': 'Any base (A, C, G, or T)',
    'R': 'Purine (A or G)',
    'Y': 'Pyrimidine (C or T)',
    'S': 'Strong interaction (G or C)',
    'W': 'Weak interaction (A or T)',
    'K': 'Keto (G or T)',
    'M': 'Amino (A or C)',
    'B': 'Not A (C, G, or T)',
    'D': 'Not C (A, G, or T)',
    'H': 'Not G (A, C, or T)',
    'V': 'Not T/U (A, C, or G)'
}

def clean_sequence(raw_seq: str) -> str:
    """
    Remove FASTA headers, newlines, numbers, spaces, and convert to uppercase.
    """
    if not raw_seq:
        return ""
    
    # If FASTA format with header line starting with '>'
    lines = raw_seq.strip().splitlines()
    seq_lines = [line.strip() for line in lines if not line.strip().startswith('>')]
    joined = "".join(seq_lines)
    
    # Strip any whitespace, digits, or non-alphabet characters
    cleaned = re.sub(r'[^A-Za-z]', '', joined).upper()
    return cleaned

def analyze_sequence(raw_sequence: str, record_meta: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Perform comprehensive DNA sequence analysis for a single nucleotide record.
    Handles standard (A, T, G, C) and ambiguous (IUPAC) bases.
    """
    seq = clean_sequence(raw_sequence)
    total_length = len(seq)
    
    if total_length == 0:
        return {
            "error": "Sequence is empty or could not be parsed.",
            "total_length": 0,
            "counts": {"A": 0, "T": 0, "G": 0, "C": 0, "ambiguous": 0},
            "gc_percentage": 0.0,
            "at_percentage": 0.0,
            "ambiguous_percentage": 0.0,
        }

    # Count canonical bases
    count_a = seq.count('A')
    count_t = seq.count('T') + seq.count('U')  # Handle RNA uracil as thymine equivalent
    count_g = seq.count('G')
    count_c = seq.count('C')
    
    canonical_total = count_a + count_t + count_g + count_c
    ambiguous_count = total_length - canonical_total
    
    # Detailed breakdown of ambiguous bases
    ambiguous_breakdown = {}
    for char in IUPAC_AMBIGUOUS_CODES:
        c = seq.count(char)
        if c > 0:
            ambiguous_breakdown[char] = {
                "count": c,
                "meaning": IUPAC_AMBIGUOUS_CODES[char]
            }

    # Percentages
    gc_percent = round(((count_g + count_c) / total_length) * 100.0, 2)
    at_percent = round(((count_a + count_t) / total_length) * 100.0, 2)
    ambiguous_percent = round((ambiguous_count / total_length) * 100.0, 2)
    
    # If ambiguous bases present, also provide unambiguous GC%
    gc_unambiguous_percent = (
        round(((count_g + count_c) / canonical_total) * 100.0, 2) 
        if canonical_total > 0 else 0.0
    )

    # Purine vs Pyrimidine calculations
    purines = count_a + count_g
    pyrimidines = count_c + count_t
    purine_pyrimidine_ratio = (
        round(purines / pyrimidines, 3) if pyrimidines > 0 else None
    )

    # Dinucleotide CpG site frequency (key for promoter / epigenetic analysis)
    cpg_count = len(re.findall(r'(?=CG)', seq))

    # Biochemical estimations:
    # 1. Estimated Molecular Weight (ssDNA in g/mol or Daltons)
    # Average dNTP MW approx: An=313.2, Tn=304.2, Cn=289.2, Gn=329.2
    mol_weight_da = round(
        (count_a * 313.21) + (count_t * 304.2) + (count_c * 289.18) + (count_g * 329.21) - 61.96, 
        2
    )

    # 2. Estimated Melting Temperature (Tm in °C)
    # Wallace rule for short sequences (<50 bp): Tm = 2*(A+T) + 4*(G+C)
    # Marmur-Doty formula for sequences >= 50 bp: Tm = 64.9 + 41 * (G + C - 16.4) / N
    if total_length < 50:
        melting_temp_c = round(2.0 * (count_a + count_t) + 4.0 * (count_g + count_c), 1)
        tm_method = "Wallace Rule (Oligo <50 bp)"
    else:
        melting_temp_c = round(64.9 + 41.0 * ((count_g + count_c) - 16.4) / total_length, 1)
        tm_method = "Marmur-Doty Formula (>50 bp, standard 50mM Na+)"

    result = {
        "accession": (record_meta or {}).get("accession", "Unknown"),
        "title": (record_meta or {}).get("title", "Untitled Sequence"),
        "organism": (record_meta or {}).get("organism", "Unknown"),
        "gene": (record_meta or {}).get("gene", "Unknown"),
        "molecule_type": (record_meta or {}).get("molecule_type", "DNA"),
        "ncbi_url": (record_meta or {}).get("ncbi_url", ""),
        "total_length": total_length,
        "counts": {
            "A": count_a,
            "T": count_t,
            "G": count_g,
            "C": count_c,
            "ambiguous": ambiguous_count
        },
        "percentages": {
            "A": round((count_a / total_length) * 100.0, 2),
            "T": round((count_t / total_length) * 100.0, 2),
            "G": round((count_g / total_length) * 100.0, 2),
            "C": round((count_c / total_length) * 100.0, 2),
            "GC": gc_percent,
            "AT": at_percent,
            "ambiguous": ambiguous_percent,
            "gc_unambiguous": gc_unambiguous_percent
        },
        "ambiguous_details": {
            "total_ambiguous": ambiguous_count,
            "percentage": ambiguous_percent,
            "breakdown": ambiguous_breakdown
        },
        "biochemical_metrics": {
            "purines": purines,
            "pyrimidines": pyrimidines,
            "purine_pyrimidine_ratio": purine_pyrimidine_ratio,
            "cpg_islands_count": cpg_count,
            "molecular_weight_kda": round(mol_weight_da / 1000.0, 2),
            "melting_temperature_c": melting_temp_c,
            "tm_method": tm_method
        },
        "preview": seq[:100] + ("..." if total_length > 100 else ""),
        "full_cleaned_sequence": seq
    }

    return result

def batch_analyze(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Analyze multiple retrieved records and attach analysis results.
    """
    analyzed_list = []
    for rec in records:
        fasta_str = rec.get("fasta", "")
        analysis = analyze_sequence(fasta_str, rec)
        # Merge record metadata with analysis
        combined = {**rec, "analysis": analysis}
        analyzed_list.append(combined)
    return analyzed_list

