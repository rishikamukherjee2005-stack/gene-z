"""
DNA Reverse Complement and In-Silico Translation Service for GeneZ.
Translates DNA codons to amino acids using standard genetic code, generates
reverse complement strands, and identifies candidate Open Reading Frames (ORFs).
"""

from typing import Dict, Any, List

# Standard Genetic Code (Universal)
GENETIC_CODE = {
    'ATA': 'I', 'ATC': 'I', 'ATT': 'I', 'ATG': 'M',
    'ACA': 'T', 'ACC': 'T', 'ACG': 'T', 'ACT': 'T',
    'AAC': 'N', 'AAT': 'N', 'AAA': 'K', 'AAG': 'K',
    'AGC': 'S', 'AGT': 'S', 'AGA': 'R', 'AGG': 'R',
    'CTA': 'L', 'CTC': 'L', 'CTG': 'L', 'CTT': 'L',
    'CCA': 'P', 'CCC': 'P', 'CCG': 'P', 'CCT': 'P',
    'CAC': 'H', 'CAT': 'H', 'CAA': 'Q', 'CAG': 'Q',
    'CGA': 'R', 'CGC': 'R', 'CGG': 'R', 'CGT': 'R',
    'GTA': 'V', 'GTC': 'V', 'GTG': 'V', 'GTT': 'V',
    'GCA': 'A', 'GCC': 'A', 'GCG': 'A', 'GCT': 'A',
    'GAC': 'D', 'GAT': 'D', 'GAA': 'E', 'GAG': 'E',
    'GGA': 'G', 'GGC': 'G', 'GGG': 'G', 'GGT': 'G',
    'TCA': 'S', 'TCC': 'S', 'TCG': 'S', 'TCT': 'S',
    'TTC': 'F', 'TTT': 'F', 'TTA': 'L', 'TTG': 'L',
    'TAC': 'Y', 'TAT': 'Y', 'TAA': '*', 'TAG': '*',
    'TGC': 'C', 'TGT': 'C', 'TGA': '*', 'TGG': 'W',
}

# Amino acid properties lookup
AMINO_ACID_NAMES = {
    'A': 'Alanine (Ala)', 'R': 'Arginine (Arg)', 'N': 'Asparagine (Asn)',
    'D': 'Aspartate (Asp)', 'C': 'Cysteine (Cys)', 'Q': 'Glutamine (Gln)',
    'E': 'Glutamate (Glu)', 'G': 'Glycine (Gly)', 'H': 'Histidine (His)',
    'I': 'Isoleucine (Ile)', 'L': 'Leucine (Leu)', 'K': 'Lysine (Lys)',
    'M': 'Methionine (Met - Start)', 'F': 'Phenylalanine (Phe)',
    'P': 'Proline (Pro)', 'S': 'Serine (Ser)', 'T': 'Threonine (Thr)',
    'W': 'Tryptophan (Trp)', 'Y': 'Tyrosine (Tyr)', 'V': 'Valine (Val)',
    '*': 'Stop Codon (Ochre/Amber/Opal)'
}

COMPLEMENT_TABLE = str.maketrans("ATGCURYMKWSBDHVN", "TACGAYRKMWSVHDBN")

def get_reverse_complement(dna_seq: str) -> str:
    """Return the 5' to 3' reverse complement of a DNA sequence."""
    clean = dna_seq.upper().replace(" ", "").replace("\n", "")
    return clean.translate(COMPLEMENT_TABLE)[::-1]

def translate_reading_frame(dna_seq: str, frame: int = 1) -> str:
    """
    Translate DNA into protein sequence for a specific reading frame (1, 2, or 3).
    Frame offset: frame 1 = offset 0, frame 2 = offset 1, frame 3 = offset 2.
    """
    offset = frame - 1
    codons = [dna_seq[i:i+3] for i in range(offset, len(dna_seq) - 2, 3)]
    protein = "".join(GENETIC_CODE.get(codon, "X") for codon in codons)
    return protein

def find_orfs(dna_seq: str, min_length_codons: int = 30) -> List[Dict[str, Any]]:
    """
    Scan all 6 reading frames (3 forward + 3 reverse) for Open Reading Frames (ORFs)
    starting with ATG and ending with an in-frame stop codon (*).
    """
    orfs = []
    clean_forward = dna_seq.upper().replace(" ", "").replace("\n", "")
    clean_reverse = get_reverse_complement(clean_forward)

    strands = [
        ("Forward (+)", clean_forward),
        ("Reverse (-)", clean_reverse)
    ]

    for strand_name, seq in strands:
        for frame in [1, 2, 3]:
            offset = frame - 1
            seq_len = len(seq)
            i = offset

            while i < seq_len - 2:
                codon = seq[i:i+3]
                if codon == "ATG":
                    start_pos = i
                    # Walk in frame until stop codon
                    j = start_pos
                    found_stop = False
                    while j < seq_len - 2:
                        stop_candidate = seq[j:j+3]
                        if GENETIC_CODE.get(stop_candidate) == "*":
                            found_stop = True
                            orf_dna = seq[start_pos:j+3]
                            codon_count = len(orf_dna) // 3
                            if codon_count >= min_length_codons:
                                protein = "".join(GENETIC_CODE.get(orf_dna[k:k+3], "X") for k in range(0, len(orf_dna), 3))
                                orfs.append({
                                    "strand": strand_name,
                                    "frame": frame,
                                    "start": start_pos + 1,
                                    "end": j + 3,
                                    "length_nt": len(orf_dna),
                                    "length_aa": codon_count - 1, # excluding stop
                                    "dna": orf_dna,
                                    "protein": protein
                                })
                            i = j + 3 # advance past stop codon
                            break
                        j += 3
                    if not found_stop:
                        break
                else:
                    i += 3

    # Sort ORFs by length descending (longest / most likely coding sequence first)
    orfs.sort(key=lambda x: x["length_aa"], reverse=True)
    return orfs

