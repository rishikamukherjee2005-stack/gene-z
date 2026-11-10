"""
Pairwise Sequence Alignment & Identity Matrix Service for GeneZ.
Implements the canonical Needleman-Wunsch global dynamic programming alignment algorithm
and generates pairwise similarity/identity matrices for retrieved DNA sequences.
"""

from typing import Dict, Any, List, Tuple

def needleman_wunsch_alignment(
    seq1: str,
    seq2: str,
    match_score: int = 2,
    mismatch_penalty: int = -1,
    gap_penalty: int = -2,
    max_align_length: int = 2000
) -> Dict[str, Any]:
    """
    Perform Needleman-Wunsch global alignment between two DNA sequences.
    For sequences exceeding max_align_length, aligns the first max_align_length bases
    to maintain interactive performance.
    """
    # Sanitize and truncate if too long for interactive browser dynamic programming
    s1 = seq1.upper()[:max_align_length]
    s2 = seq2.upper()[:max_align_length]

    n = len(s1)
    m = len(s2)

    if n == 0 or m == 0:
        return {
            "error": "One or both sequences are empty.",
            "identity_percentage": 0.0,
            "score": 0,
            "aligned_seq1": s1,
            "aligned_seq2": s2,
            "match_line": "",
            "matches": 0,
            "mismatches": 0,
            "gaps": 0
        }

    # Initialize score matrix and traceback matrix
    # Traceback codes: 1=Diagonal (match/mismatch), 2=Up (gap in s2), 3=Left (gap in s1)
    score_matrix = [[0] * (m + 1) for _ in range(n + 1)]
    trace_matrix = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        score_matrix[i][0] = i * gap_penalty
        trace_matrix[i][0] = 2  # Up

    for j in range(1, m + 1):
        score_matrix[0][j] = j * gap_penalty
        trace_matrix[0][j] = 3  # Left

    # Dynamic programming matrix filling
    for i in range(1, n + 1):
        char1 = s1[i - 1]
        for j in range(1, m + 1):
            char2 = s2[j - 1]

            match_or_mismatch = match_score if char1 == char2 else mismatch_penalty
            diagonal_score = score_matrix[i - 1][j - 1] + match_or_mismatch
            up_score = score_matrix[i - 1][j] + gap_penalty
            left_score = score_matrix[i][j - 1] + gap_penalty

            best_score = max(diagonal_score, up_score, left_score)
            score_matrix[i][j] = best_score

            if best_score == diagonal_score:
                trace_matrix[i][j] = 1
            elif best_score == up_score:
                trace_matrix[i][j] = 2
            else:
                trace_matrix[i][j] = 3

    # Traceback to construct the alignment
    aligned_s1 = []
    aligned_s2 = []
    matches = 0
    mismatches = 0
    gaps = 0

    i, j = n, m
    while i > 0 or j > 0:
        if i > 0 and j > 0 and trace_matrix[i][j] == 1:
            char1 = s1[i - 1]
            char2 = s2[j - 1]
            aligned_s1.append(char1)
            aligned_s2.append(char2)
            if char1 == char2:
                matches += 1
            else:
                mismatches += 1
            i -= 1
            j -= 1
        elif i > 0 and (j == 0 or trace_matrix[i][j] == 2):
            aligned_s1.append(s1[i - 1])
            aligned_s2.append("-")
            gaps += 1
            i -= 1
        else:
            aligned_s1.append("-")
            aligned_s2.append(s2[j - 1])
            gaps += 1
            j -= 1

    aligned_s1.reverse()
    aligned_s2.reverse()

    str1 = "".join(aligned_s1)
    str2 = "".join(aligned_s2)

    # Build consensus match line
    # '|' = match, '.' = mismatch, ' ' = gap
    match_line = []
    for c1, c2 in zip(str1, str2):
        if c1 == c2 and c1 != "-":
            match_line.append("|")
        elif c1 == "-" or c2 == "-":
            match_line.append(" ")
        else:
            match_line.append(".")
    consensus = "".join(match_line)

    total_aligned_positions = len(str1)
    identity_pct = (
        round((matches / total_aligned_positions) * 100.0, 2)
        if total_aligned_positions > 0 else 0.0
    )

    final_score = score_matrix[n][m]

    return {
        "success": True,
        "score": final_score,
        "identity_percentage": identity_pct,
        "matches": matches,
        "mismatches": mismatches,
        "gaps": gaps,
        "aligned_length": total_aligned_positions,
        "aligned_seq1": str1,
        "aligned_seq2": str2,
        "match_line": consensus,
        "truncated": (len(seq1) > max_align_length or len(seq2) > max_align_length),
        "evaluated_lengths": {"seq1": n, "seq2": m}
    }

def compute_pairwise_identity_matrix(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compute full N x N pairwise identity matrix between all retrieved sequences.
    """
    accessions = [r.get("accession", f"Seq_{i+1}") for i, r in enumerate(records)]
    n = len(records)
    matrix = [[100.0] * n for _ in range(n)]

    for i in range(n):
        seq_i = records[i].get("analysis", {}).get("full_cleaned_sequence", "")
        for j in range(i + 1, n):
            seq_j = records[j].get("analysis", {}).get("full_cleaned_sequence", "")
            # Quick identity estimate using first 600 bp for fast matrix rendering
            res = needleman_wunsch_alignment(seq_i, seq_j, max_align_length=600)
            ident = res.get("identity_percentage", 0.0)
            matrix[i][j] = ident
            matrix[j][i] = ident

    return {
        "accessions": accessions,
        "matrix": matrix
    }

