"""
GeneZ Comprehensive Backend Test Suite.
Tests API routes, sequence analysis algorithms, comparative statistics,
IUPAC ambiguous base resolution, export formatting, and error handling.
"""

import sys
import os
import json
import unittest

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app import app
from analyzer_service import clean_sequence, analyze_sequence, batch_analyze
from comparative_service import generate_comparative_analysis
from export_service import generate_multi_fasta, generate_csv_report

class GeneZBackendTestCase(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        from config import Config
        self.orig_config_key = Config.GEMINI_API_KEY
        self.orig_env_key = os.environ.get("GEMINI_API_KEY", "")
        Config.GEMINI_API_KEY = ""
        os.environ["GEMINI_API_KEY"] = ""
        self.client = app.test_client()

    def tearDown(self):
        from config import Config
        Config.GEMINI_API_KEY = self.orig_config_key
        os.environ["GEMINI_API_KEY"] = self.orig_env_key

    def test_health_endpoint(self):
        """Test /api/health returns online status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "online")
        self.assertIn("gemini_configured", data)

    def test_dna_cleaning_and_counting(self):
        """Test clean_sequence strips headers, whitespace, and numbers."""
        raw_fasta = ">TestHeader 123\nATG C12\ntg\n"
        cleaned = clean_sequence(raw_fasta)
        self.assertEqual(cleaned, "ATGCTG")

    def test_ambiguous_iupac_nucleotide_analysis(self):
        """Test correct handling of canonical and ambiguous IUPAC bases."""
        test_seq = "ATGC" + "N" + "R" + "Y"  # 4 canonical + 3 ambiguous = 7 total
        analysis = analyze_sequence(test_seq, {"accession": "TEST_001"})
        
        self.assertEqual(analysis["total_length"], 7)
        self.assertEqual(analysis["counts"]["A"], 1)
        self.assertEqual(analysis["counts"]["T"], 1)
        self.assertEqual(analysis["counts"]["G"], 1)
        self.assertEqual(analysis["counts"]["C"], 1)
        self.assertEqual(analysis["counts"]["ambiguous"], 3)
        self.assertAlmostEqual(analysis["percentages"]["GC"], round((2 / 7) * 100, 2))
        self.assertAlmostEqual(analysis["percentages"]["AT"], round((2 / 7) * 100, 2))
        self.assertIn("N", analysis["ambiguous_details"]["breakdown"])
        self.assertIn("R", analysis["ambiguous_details"]["breakdown"])
        self.assertIn("Y", analysis["ambiguous_details"]["breakdown"])

    def test_biochemical_calculations(self):
        """Test Tm, molecular weight, and purine/pyrimidine ratio."""
        seq = "ATGCGATCGATCGATC" # 16 bp, 4A, 4T, 4G, 4C (50% GC)
        analysis = analyze_sequence(seq, {"accession": "OLIGO_16"})
        # Wallace rule for < 50 bp: 2*(A+T) + 4*(G+C) = 2*(8) + 4*(8) = 16 + 32 = 48 °C
        self.assertEqual(analysis["biochemical_metrics"]["melting_temperature_c"], 48.0)
        self.assertEqual(analysis["biochemical_metrics"]["purine_pyrimidine_ratio"], 1.0)
        self.assertGreater(analysis["biochemical_metrics"]["molecular_weight_kda"], 0)

    def test_comparative_analysis_and_disclaimer(self):
        """Test comparative matrix, observations, and explicit scientific disclaimer."""
        rec1 = {
            "accession": "REC1",
            "title": "Gene Rec 1",
            "fasta": ">REC1\nATGCATGC",
            "length": 8
        }
        rec2 = {
            "accession": "REC2",
            "title": "Gene Rec 2",
            "fasta": ">REC2\nGCGCGCGCGCGC",
            "length": 12
        }
        analyzed = batch_analyze([rec1, rec2])
        comp = generate_comparative_analysis(analyzed)
        
        self.assertEqual(len(comp["comparison_table"]), 2)
        self.assertGreater(len(comp["observations"]), 0)
        # Check disclaimer rule
        self.assertIn("alignment", comp["disclaimer"].lower())
        self.assertIn("homology", comp["disclaimer"].lower())

    def test_search_endpoint_with_fallback_data(self):
        """Test POST /api/search with valid organism and gene."""
        payload = {
            "organism": "Escherichia coli",
            "gene": "lacZ",
            "max_records": 3
        }
        response = self.client.post(
            "/api/search",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertEqual(data["gene"], "lacZ")
        self.assertGreater(len(data["records"]), 0)
        self.assertIn("comparative", data)

    def test_search_missing_fields_error(self):
        """Test POST /api/search returns 400 when fields are missing."""
        response = self.client.post(
            "/api/search",
            data=json.dumps({"organism": "Escherichia coli"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data["success"])

    def test_custom_fasta_analysis_endpoint(self):
        """Test POST /api/analyze-custom."""
        payload = {
            "fasta": ">CustomTest\nATGCATGCATGC",
            "organism": "Synthetic Organism",
            "gene": "synG"
        }
        response = self.client.post(
            "/api/analyze-custom",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertEqual(data["record"]["analysis"]["total_length"], 12)

    def test_export_fasta_endpoint(self):
        """Test POST /api/export/fasta streams multi-FASTA file."""
        payload = {
            "records": [
                {"accession": "ACC1", "title": "Test 1", "fasta": ">ACC1\nATGC"}
            ],
            "gene": "test"
        }
        response = self.client.post(
            "/api/export/fasta",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(b">ACC1\nATGC", response.data)
        self.assertIn("attachment", response.headers.get("Content-Disposition", ""))

    def test_export_csv_endpoint(self):
        """Test POST /api/export/csv streams CSV report."""
        record = {
            "accession": "ACC1",
            "organism": "E. coli",
            "gene": "lacZ",
            "fasta": ">ACC1\nATGC",
            "length": 4
        }
        analyzed = batch_analyze([record])
        response = self.client.post(
            "/api/export/csv",
            data=json.dumps({"records": analyzed, "gene": "lacZ"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        csv_text = response.data.decode("utf-8")
        self.assertIn("GC Content (%)", csv_text)
        self.assertIn("ACC1", csv_text)

    def test_gemini_chat_endpoint(self):
        """Test POST /api/chat provides biological briefing."""
        payload = {
            "organism": "Escherichia coli",
            "gene": "lacZ",
            "records": [],
            "comparative": {"summary_stats": {"gc": {"avg": 52.0}, "at": {"avg": 48.0}}},
            "message": "What is the biological function of lacZ?"
        }
        response = self.client.post(
            "/api/chat",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertIn("reply", data)
        self.assertGreater(len(data["reply"]), 50)

    def test_align_endpoint(self):
        """Test POST /api/align performs Needleman-Wunsch global alignment."""
        payload = {
            "seq1": "ATGCGATCGATC",
            "seq2": "ATGCGATCGATC",
            "acc1": "SeqA",
            "acc2": "SeqB"
        }
        response = self.client.post(
            "/api/align",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertEqual(data["identity_percentage"], 100.0)
        self.assertEqual(data["gaps"], 0)
        self.assertEqual(data["mismatches"], 0)

    def test_translate_endpoint(self):
        """Test POST /api/translate generates reverse complement and reading frames."""
        payload = {
            "dna": "ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG"
        }
        response = self.client.post(
            "/api/translate",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertIn("reverse_complement", data)
        self.assertIn("+1", data["translations"])
        self.assertIn("-1", data["translations"])

    def test_export_json_endpoint(self):
        """Test POST /api/export/json streams JSON file."""
        payload = {"gene": "lacZ", "metrics": {"gc": 52.0}}
        response = self.client.post(
            "/api/export/json",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"lacZ", response.data)
        self.assertIn("attachment", response.headers.get("Content-Disposition", ""))

if __name__ == "__main__":
    unittest.main()
