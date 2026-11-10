"""
Google Gemini AI Assistant Service for GeneZ.
Integrates Google's Gemini API with real-time biological context:
organism, gene annotations, sequence length, GC/AT content,
nucleotide composition, and comparative observations.
"""

import os
from typing import List, Dict, Any, Optional
from config import Config

# System prompt defining role and undergraduate bioinformatics standards
SYSTEM_INSTRUCTION = """
You are GeneZ BioAssistant, an expert bioinformatics tutor and molecular biologist.
Your role is to explain biological concepts and provide rigorous, undergraduate-level
scientific interpretations based on the user's retrieved NCBI gene sequence records and
DNA sequence analysis.

Core Responsibilities:
1. Explain the biological function of the specified gene and its physiological importance.
2. Identify the protein, enzyme, or RNA product it encodes, including known catalytic roles or pathways.
3. Interpret the physical and biological significance of the calculated GC/AT percentages:
   - High GC: 3 hydrogen bonds per pair, elevated thermal stability (Tm), codon usage bias, GC-rich isochores.
   - Low GC (AT-rich): 2 hydrogen bonds per pair, lower Tm, AT-rich promoter TATA boxes, mobile elements.
4. Compare retrieved records (e.g. why sequences differ: complete CDS vs mRNA transcript variants, alternative splicing, partial sequencing fragments).
5. Address the user's specific questions with scientific accuracy.

Grounding & Honesty Rules:
- Base your analysis on the provided context (organism, gene, accessions, length, nucleotide metrics, GC%, observations).
- Do NOT invent or hallucinate sequence features or alignments not present in the data.
- If asked about evolutionary relatedness or percentage sequence identity without alignment data, remind the user that pairwise alignment (e.g. BLAST, Needleman-Wunsch) is necessary to determine homology.
- Format responses cleanly with markdown headings, bullet points, and bold terms for readability.
"""

def generate_context_prompt(
    organism: str,
    gene: str,
    analyzed_records: List[Dict[str, Any]],
    comparative_data: Dict[str, Any],
    user_query: str
) -> str:
    """
    Format the complete biological context into a structured prompt.
    """
    context_lines = [
        f"### RETRIEVED GENE CONTEXT",
        f"- Target Organism: {organism}",
        f"- Target Gene: {gene}",
        f"- Number of Records Retrieved: {len(analyzed_records)}",
        ""
    ]

    for idx, rec in enumerate(analyzed_records):
        analysis = rec.get("analysis", {})
        counts = analysis.get("counts", {})
        pcts = analysis.get("percentages", {})
        bio = analysis.get("biochemical_metrics", {})
        
        context_lines.extend([
            f"**Record {idx+1}: {rec.get('accession')}**",
            f"  - Title: {rec.get('title')}",
            f"  - Molecule Type: {rec.get('molecule_type', 'DNA')}",
            f"  - Length: {analysis.get('total_length')} bp",
            f"  - Nucleotide Counts: A={counts.get('A')}, T={counts.get('T')}, G={counts.get('G')}, C={counts.get('C')}, Ambiguous={counts.get('ambiguous')}",
            f"  - GC Content: {pcts.get('GC')}% | AT Content: {pcts.get('AT')}% | Ambiguous: {pcts.get('ambiguous')}%",
            f"  - Estimated Tm: {bio.get('melting_temperature_c')} °C",
            f"  - Estimated Mol. Weight: {bio.get('molecular_weight_kda')} kDa",
            ""
        ])

    obs = comparative_data.get("observations", [])
    if obs:
        context_lines.append("### AUTOMATED COMPARATIVE OBSERVATIONS:")
        for o in obs:
            context_lines.append(f"- {o}")
        context_lines.append("")

    context_lines.extend([
        "### USER INQUIRY:",
        user_query,
        "",
        "Please provide a scientifically detailed, undergraduate-level response addressing the inquiry in the context of the retrieved data above."
    ])

    return "\n".join(context_lines)

def query_gemini_assistant(
    organism: str,
    gene: str,
    analyzed_records: List[Dict[str, Any]],
    comparative_data: Dict[str, Any],
    user_query: str,
    chat_history: Optional[List[Dict[str, str]]] = None,
    api_key_override: Optional[str] = None
) -> Dict[str, Any]:
    """
    Send prompt with bio context to Gemini API.
    Uses GEMINI_API_KEY from environment or user override.
    Provides structured fallback if no key is supplied.
    """
    api_key = api_key_override or Config.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

    # Build the full prompt with biological context
    full_prompt = generate_context_prompt(
        organism, gene, analyzed_records, comparative_data, user_query
    )

    if not api_key:
        return generate_simulated_ai_response(
            organism, gene, analyzed_records, comparative_data, user_query
        )

    # Attempt 1: Using modern google-genai SDK
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        # Test available models in preference order
        candidate_models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"]
        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=full_prompt,
                    config={
                        "system_instruction": SYSTEM_INSTRUCTION,
                        "temperature": 0.3,
                        "max_output_tokens": 1200
                    }
                )
                if response and response.text:
                    return {
                        "success": True,
                        "reply": response.text,
                        "model_used": model_name,
                        "mode": "live_gemini"
                    }
            except Exception as model_err:
                continue
    except Exception as e:
        # Fall through to google-generativeai or fallback
        pass

    # Attempt 2: Using legacy google-generativeai SDK
    try:
        import google.generativeai as genai_legacy
        genai_legacy.configure(api_key=api_key)
        
        for model_name in ["gemini-1.5-flash", "gemini-pro"]:
            try:
                model = genai_legacy.GenerativeModel(
                    model_name=model_name,
                    system_instruction=SYSTEM_INSTRUCTION
                )
                response = model.generate_content(
                    full_prompt,
                    generation_config={"temperature": 0.3, "max_output_tokens": 1200}
                )
                if response and response.text:
                    return {
                        "success": True,
                        "reply": response.text,
                        "model_used": model_name,
                        "mode": "live_gemini"
                    }
            except Exception:
                continue
    except Exception as legacy_err:
        pass

    # If API key failed (invalid key or quota reached)
    return {
        "success": False,
        "error": "Failed to connect to Gemini API with the provided key. Please verify your GEMINI_API_KEY.",
        "reply": generate_simulated_ai_response(organism, gene, analyzed_records, comparative_data, user_query)["reply"],
        "mode": "fallback_simulated"
    }

def generate_simulated_ai_response(
    organism: str,
    gene: str,
    analyzed_records: List[Dict[str, Any]],
    comparative_data: Dict[str, Any],
    user_query: str
) -> Dict[str, Any]:
    """
    Intelligent undergraduate biotechnology knowledge generator used when
    GEMINI_API_KEY is not configured yet. Ensures zero interruption during
    evaluation or demonstration.
    """
    stats = comparative_data.get("summary_stats", {})
    avg_gc = stats.get("gc", {}).get("avg", 50.0)
    avg_at = stats.get("at", {}).get("avg", 50.0)
    rec_count = len(analyzed_records)

    first_rec = analyzed_records[0] if analyzed_records else {}
    title = first_rec.get("title", f"{gene} in {organism}")

    response_text = f"""
> **GeneZ AI Biological Briefing** *(Educational Mode — Enter your `GEMINI_API_KEY` in `.env` for customized dynamic queries)*

### 1. Biological Function of {gene} in *{organism}*
- **Gene Identity**: `{gene}` encodes a critical molecular product in *{organism}*.
- **Annotation Reference**: *{title}*
- **Cellular Significance**: In cellular physiology, `{gene}` plays a central metabolic, structural, or regulatory role. For instance, in bacterial models such as *E. coli* (*lacZ*), it hydrolyzes lactose into glucose and galactose under the classic negative and positive transcriptional control of the lac operon; in human models (*TP53*), it acts as a canonical tumor suppressor transcription factor mediating cell cycle arrest, DNA repair, and apoptosis.

---

### 2. Sequence Composition & GC Content Analysis
- **Observed GC Percentage**: **{avg_gc}%** (with AT Content at **{avg_at}%**) across {rec_count} retrieved sequence record(s).
- **Thermodynamic Implications**:
  - G-C pairs are linked by **three hydrogen bonds**, compared to only **two hydrogen bonds** between A-T pairs.
  - An average GC content of {avg_gc}% yields an estimated melting temperature (Tm) commensurate with standard physiological double-helix stability.
  - Genomic regions with higher GC content generally require more thermal denaturation energy during PCR amplification and often correlate with gene-dense chromosomal isochores.

---

### 3. Structural Comparison of Retrieved Records
- You have retrieved **{rec_count}** sequence record(s).
"""

    if rec_count > 1:
        lens = [r.get("analysis", {}).get("total_length", 0) for r in analyzed_records]
        response_text += f"- **Length Discrepancy**: Sequence lengths span from **{min(lens)} bp** to **{max(lens)} bp**.\n"
        response_text += f"- Shorter sequences often correspond to specific cloned exons, regulatory operator/promoter regions, or Sanger sequencing reads, whereas longer records typically encompass complete mRNAs or genomic operon assemblies.\n"

    response_text += f"""
---

### 4. Scientific Guidance
To perform live interactive chat with Google's Gemini models, configure your `GEMINI_API_KEY` in `backend/.env`. You can then ask custom questions such as:
- *"What specific domain of this protein binds DNA or substrates?"*
- *"Explain the codon bias expected with a GC content of {avg_gc}%."*
- *"How do introns/exons account for the length difference between these records?"*
"""

    return {
        "success": True,
        "reply": response_text.strip(),
        "model_used": "GeneZ BioKnowledge Engine (Fallback / Guided)",
        "mode": "simulated"
    }

