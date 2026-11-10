"""
NCBI Entrez E-utilities Service for GeneZ.
Queries the NCBI Nucleotide database using Entrez REST E-utilities, parses XML/JSON
summaries and FASTA sequence streams, and manages caching and fallback logic.
"""

import requests
import re
from typing import List, Dict, Any, Optional
from config import Config
from sample_data import get_sample_records

NCBI_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

def build_entrez_search_query(organism: str, gene: str) -> str:
    """
    Construct a targeted Entrez search query in nucleotide database.
    Prioritizes mRNA, coding sequences, and genes of manageable size (<100,000 bp)
    to prevent fetching whole megabase chromosomes.
    """
    clean_org = organism.strip().replace('"', '')
    clean_gene = gene.strip().replace('"', '')
    
    # Target mRNA / RefSeq / CDS or bounded length nucleotide sequences
    query = (
        f'("{clean_gene}"[Gene Name] OR "{clean_gene}"[Title] OR "{clean_gene}") '
        f'AND ("{clean_org}"[Organism] OR "{clean_org}") '
        f'AND 100:100000[SLEN]'
    )
    return query

def search_ncbi_records(organism: str, gene: str, max_records: int = 5) -> Dict[str, Any]:
    """
    Search NCBI Entrez for relevant nucleotide records matching organism and gene.
    Returns parsed records with FASTA sequence and metadata.
    """
    clean_org = organism.strip()
    clean_gene = gene.strip()

    if not clean_org or not clean_gene:
        return {
            "success": False,
            "error": "Both organism name and gene name are required for search.",
            "records": []
        }

    # First check pre-curated sample dataset for instantaneous response
    # especially helpful for college offline presentations or tests
    cached_records = get_sample_records(clean_org, clean_gene)
    
    headers = {
        "User-Agent": "GeneZ-Bioinformatics-Tool/1.0 (academic; undergraduate project)"
    }
    params_base = {
        "email": Config.NCBI_EMAIL,
        "tool": "GeneZ"
    }
    if Config.NCBI_API_KEY:
        params_base["api_key"] = Config.NCBI_API_KEY

    try:
        # Step 1: ESearch to obtain UID list
        search_query = build_entrez_search_query(clean_org, clean_gene)
        search_params = {
            **params_base,
            "db": "nucleotide",
            "term": search_query,
            "retmax": max_records,
            "retmode": "json",
            "sort": "relevance"
        }

        search_resp = requests.get(
            f"{NCBI_BASE_URL}/esearch.fcgi",
            params=search_params,
            headers=headers,
            timeout=8
        )

        if search_resp.status_code != 200:
            # If NCBI returns non-200 and we have cached data, fallback cleanly
            if cached_records:
                return {
                    "success": True,
                    "source": "curated_cache_fallback",
                    "note": "NCBI Entrez server returned an error; displayed verified sample records.",
                    "records": cached_records[:max_records]
                }
            return {
                "success": False,
                "error": f"NCBI Entrez search returned status {search_resp.status_code}.",
                "records": []
            }

        search_data = search_resp.json()
        id_list = search_data.get("esearchresult", {}).get("idlist", [])

        # If zero records found with restrictive query, retry with broader terms
        if not id_list:
            broad_query = f'("{clean_gene}") AND ("{clean_org}"[Organism])'
            search_params["term"] = broad_query
            broad_resp = requests.get(
                f"{NCBI_BASE_URL}/esearch.fcgi",
                params=search_params,
                headers=headers,
                timeout=8
            )
            if broad_resp.status_code == 200:
                id_list = broad_resp.json().get("esearchresult", {}).get("idlist", [])

        if not id_list:
            if cached_records:
                return {
                    "success": True,
                    "source": "curated_cache_fallback",
                    "note": f"No online NCBI records matched '{clean_gene}' in '{clean_org}'; loaded verified reference records.",
                    "records": cached_records[:max_records]
                }
            return {
                "success": False,
                "error": f"No records found in NCBI Nucleotide database for '{clean_gene}' in '{clean_org}'. Please check spelling or try a synonym (e.g., TP53, lacZ, ACT1).",
                "records": []
            }

        # Step 2: ESummary to get descriptive metadata
        summary_params = {
            **params_base,
            "db": "nucleotide",
            "id": ",".join(id_list),
            "retmode": "json"
        }
        sum_resp = requests.get(
            f"{NCBI_BASE_URL}/esummary.fcgi",
            params=summary_params,
            headers=headers,
            timeout=8
        )
        summary_results = {}
        if sum_resp.status_code == 200:
            summary_results = sum_resp.json().get("result", {})

        # Step 3: EFetch to get FASTA sequences
        fetch_params = {
            **params_base,
            "db": "nucleotide",
            "id": ",".join(id_list),
            "rettype": "fasta",
            "retmode": "text"
        }
        fetch_resp = requests.get(
            f"{NCBI_BASE_URL}/efetch.fcgi",
            params=fetch_params,
            headers=headers,
            timeout=10
        )

        fasta_text = fetch_resp.text if fetch_resp.status_code == 200 else ""
        fasta_blocks = parse_multi_fasta(fasta_text)

        # Assemble unified records
        records = []
        for uid in id_list:
            meta = summary_results.get(uid, {})
            accession = meta.get("caption") or meta.get("accessionversion") or uid
            title = meta.get("title") or f"{clean_org} {clean_gene} sequence"
            seq_len = meta.get("slen", 0)
            biomol = meta.get("biomol") or meta.get("moltype") or "DNA"
            
            # Find matching FASTA by accession or UID
            matched_fasta = ""
            for header, seq in fasta_blocks:
                if accession in header or uid in header:
                    matched_fasta = f">{header}\n{seq}"
                    break
            
            # If not matched specifically, pick corresponding index
            if not matched_fasta and len(records) < len(fasta_blocks):
                idx = len(records)
                matched_fasta = f">{fasta_blocks[idx][0]}\n{fasta_blocks[idx][1]}"

            if not matched_fasta:
                continue

            records.append({
                "id": uid,
                "accession": accession,
                "organism": clean_org,
                "gene": clean_gene,
                "title": title,
                "molecule_type": biomol,
                "length": seq_len if seq_len > 0 else len(re.sub(r'[^A-Za-z]', '', matched_fasta)),
                "ncbi_url": f"https://www.ncbi.nlm.nih.gov/nuccore/{accession}",
                "description": title,
                "fasta": matched_fasta
            })

        if not records and cached_records:
            return {
                "success": True,
                "source": "curated_cache_fallback",
                "note": "Could not parse live NCBI fasta streams; loaded verified reference records.",
                "records": cached_records[:max_records]
            }

        return {
            "success": True,
            "source": "ncbi_live",
            "records": records[:max_records]
        }

    except requests.exceptions.RequestException as req_err:
        # If offline or network issue, fallback to sample cache
        if cached_records:
            return {
                "success": True,
                "source": "curated_cache_fallback",
                "note": f"Offline mode / network timeout connecting to NCBI ({str(req_err)[:60]}...). Loaded verified academic reference records.",
                "records": cached_records[:max_records]
            }
        return {
            "success": False,
            "error": f"Network error connecting to NCBI Entrez: {str(req_err)}. Please check your internet connection.",
            "records": []
        }
    except Exception as e:
        if cached_records:
            return {
                "success": True,
                "source": "curated_cache_fallback",
                "note": f"Unexpected issue querying NCBI ({str(e)[:60]}...). Loaded verified academic reference records.",
                "records": cached_records[:max_records]
            }
        return {
            "success": False,
            "error": f"An error occurred while retrieving NCBI records: {str(e)}",
            "records": []
        }

def parse_multi_fasta(fasta_str: str) -> List[tuple]:
    """
    Split a raw multi-FASTA string into a list of (header, sequence) tuples.
    """
    entries = []
    if not fasta_str or not fasta_str.strip():
        return entries

    blocks = fasta_str.strip().split('>')
    for block in blocks:
        if not block.strip():
            continue
        lines = block.strip().splitlines()
        header = lines[0]
        sequence = "".join(line.strip() for line in lines[1:])
        entries.append((header, sequence))

    return entries

