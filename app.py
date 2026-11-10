"""
GeneZ - AI-Powered Gene Sequence Retrieval and Analysis Tool
Flask Backend Entry Point & REST API Service.
"""

import os
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from config import Config
from ncbi_service import search_ncbi_records
from analyzer_service import batch_analyze, analyze_sequence
from comparative_service import generate_comparative_analysis
from gemini_service import query_gemini_assistant
from export_service import generate_multi_fasta, generate_csv_report
from alignment_service import needleman_wunsch_alignment, compute_pairwise_identity_matrix
from translation_service import get_reverse_complement, translate_reading_frame, find_orfs

# Initialize Flask app
# Frontend path: ../frontend
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

app = Flask(__name__, static_folder=os.path.join(FRONTEND_DIR, "static"), template_folder=FRONTEND_DIR)
CORS(app)  # Enable Cross-Origin Resource Sharing for API

@app.route("/")
def serve_index():
    """Serve the GeneZ React single page application."""
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/static/<path:filename>")
def serve_static(filename):
    """Serve frontend static assets (CSS, JS, icons)."""
    return send_from_directory(os.path.join(FRONTEND_DIR, "static"), filename)

@app.route("/favicon.ico")
def favicon():
    """Handle browser favicon request without 404."""
    return Response(status=204)

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint confirming API status."""
    has_gemini = bool(Config.GEMINI_API_KEY)
    return jsonify({
        "status": "online",
        "service": "GeneZ Bioinformatics Platform",
        "version": "1.0.0",
        "ncbi_email": Config.NCBI_EMAIL,
        "gemini_configured": has_gemini
    })

@app.route("/api/search", methods=["POST"])
def search_and_analyze():
    """
    Search NCBI Entrez for organism + gene, fetch FASTA sequences,
    perform DNA sequence metrics analysis, and compute comparative statistics.
    """
    data = request.get_json() or {}
    organism = data.get("organism", "").strip()
    gene = data.get("gene", "").strip()
    max_records = int(data.get("max_records", 4))

    # Clamp max records between 1 and 8 to ensure responsive API performance
    max_records = max(1, min(max_records, 8))

    if not organism or not gene:
        return jsonify({
            "success": False,
            "error": "Both Organism name (e.g., 'Escherichia coli') and Gene name (e.g., 'lacZ') are required."
        }), 400

    # 1. Retrieve records from NCBI Entrez
    retrieval_res = search_ncbi_records(organism, gene, max_records=max_records)
    
    if not retrieval_res.get("success"):
        return jsonify({
            "success": False,
            "error": retrieval_res.get("error", "No records found.")
        }), 404

    raw_records = retrieval_res.get("records", [])
    if not raw_records:
        return jsonify({
            "success": False,
            "error": f"No valid nucleotide sequences could be retrieved for '{gene}' in '{organism}'."
        }), 404

    # 2. Perform Python DNA sequence analysis
    analyzed_records = batch_analyze(raw_records)

    # 3. Compute comparative analysis, graphs datasets, and scientific observations
    comparative_results = generate_comparative_analysis(analyzed_records)

    return jsonify({
        "success": True,
        "organism": organism,
        "gene": gene,
        "source": retrieval_res.get("source", "ncbi_live"),
        "note": retrieval_res.get("note", ""),
        "record_count": len(analyzed_records),
        "records": analyzed_records,
        "comparative": comparative_results
    })

@app.route("/api/analyze-custom", methods=["POST"])
def analyze_custom_sequence():
    """
    Analyze a custom user-pasted FASTA sequence.
    """
    data = request.get_json() or {}
    fasta = data.get("fasta", "").strip()
    organism = data.get("organism", "Custom / Synthetic").strip()
    gene = data.get("gene", "Sample").strip()

    if not fasta:
        return jsonify({"success": False, "error": "FASTA sequence is required."}), 400

    record_meta = {
        "accession": "CUSTOM_001",
        "title": f"Custom sequence ({organism} {gene})",
        "organism": organism,
        "gene": gene,
        "molecule_type": "DNA",
        "ncbi_url": "#"
    }

    analysis = analyze_sequence(fasta, record_meta)
    record = {**record_meta, "fasta": fasta, "analysis": analysis}
    comparative = generate_comparative_analysis([record])

    return jsonify({
        "success": True,
        "record": record,
        "comparative": comparative
    })

@app.route("/api/chat", methods=["POST"])
def gemini_chat():
    """
    Interact with Google Gemini AI Assistant with full gene & sequence context.
    """
    data = request.get_json() or {}
    organism = data.get("organism", "")
    gene = data.get("gene", "")
    records = data.get("records", [])
    comparative_data = data.get("comparative", {})
    message = data.get("message", "").strip()
    chat_history = data.get("chat_history", [])
    api_key_override = data.get("api_key", "").strip()

    if not message:
        return jsonify({"success": False, "error": "Message cannot be empty."}), 400

    response = query_gemini_assistant(
        organism=organism,
        gene=gene,
        analyzed_records=records,
        comparative_data=comparative_data,
        user_query=message,
        chat_history=chat_history,
        api_key_override=api_key_override or None
    )

    return jsonify(response)

@app.route("/api/export/fasta", methods=["POST"])
def export_fasta():
    """Download all retrieved sequences as a multi-FASTA file."""
    data = request.get_json() or {}
    records = data.get("records", [])
    gene = data.get("gene", "sequence").replace(" ", "_")
    
    fasta_content = generate_multi_fasta(records)
    filename = f"GeneZ_{gene}_sequences.fasta"

    return Response(
        fasta_content,
        mimetype="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.route("/api/export/csv", methods=["POST"])
def export_csv():
    """Download complete sequence analysis report as CSV."""
    data = request.get_json() or {}
    records = data.get("records", [])
    gene = data.get("gene", "analysis").replace(" ", "_")

    csv_content = generate_csv_report(records)
    filename = f"GeneZ_{gene}_analysis_report.csv"

    return Response(
        csv_content,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.route("/api/align", methods=["POST"])
def align_sequences():
    """
    Perform Needleman-Wunsch global alignment between two selected sequences.
    """
    data = request.get_json() or {}
    seq1 = data.get("seq1", "")
    seq2 = data.get("seq2", "")
    acc1 = data.get("acc1", "Sequence 1")
    acc2 = data.get("acc2", "Sequence 2")

    result = needleman_wunsch_alignment(seq1, seq2)
    result["acc1"] = acc1
    result["acc2"] = acc2
    return jsonify(result)

@app.route("/api/translate", methods=["POST"])
def translate_dna():
    """
    Generate reverse complement, 6-frame translation, and detected candidate ORFs.
    """
    data = request.get_json() or {}
    dna_seq = data.get("dna", "").strip()

    if not dna_seq:
        return jsonify({"success": False, "error": "DNA sequence is required."}), 400

    rev_comp = get_reverse_complement(dna_seq)
    
    # 3 Forward reading frames + 3 Reverse reading frames
    frames = {
        "+1": translate_reading_frame(dna_seq, 1),
        "+2": translate_reading_frame(dna_seq, 2),
        "+3": translate_reading_frame(dna_seq, 3),
        "-1": translate_reading_frame(rev_comp, 1),
        "-2": translate_reading_frame(rev_comp, 2),
        "-3": translate_reading_frame(rev_comp, 3),
    }

    orfs = find_orfs(dna_seq, min_length_codons=20)

    return jsonify({
        "success": True,
        "dna_length": len(dna_seq),
        "reverse_complement": rev_comp,
        "translations": frames,
        "orfs": orfs[:15]  # Top candidate ORFs
    })

@app.route("/api/identity-matrix", methods=["POST"])
def identity_matrix():
    """
    Compute pairwise percentage identity matrix across all retrieved sequences.
    """
    data = request.get_json() or {}
    records = data.get("records", [])

    if len(records) < 2:
        return jsonify({"success": False, "error": "At least 2 sequences required for matrix."}), 400

    matrix_res = compute_pairwise_identity_matrix(records)
    return jsonify({"success": True, **matrix_res})

@app.route("/api/export/json", methods=["POST"])
def export_json():
    """Download full analysis data and comparative results as JSON."""
    data = request.get_json() or {}
    gene = data.get("gene", "analysis").replace(" ", "_")
    filename = f"GeneZ_{gene}_data.json"

    import json
    json_str = json.dumps(data, indent=2)

    return Response(
        json_str,
        mimetype="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

if __name__ == "__main__":
    print(f"============================================================")
    print(f"  GeneZ - AI-Powered Gene Sequence Retrieval and Analysis  ")
    print(f"  Server starting at: http://{Config.HOST}:{Config.PORT}     ")
    print(f"============================================================")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)

