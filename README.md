# GeneZ – AI-Powered Gene Sequence Retrieval and Analysis Tool

![GeneZ Platform](https://img.shields.io/badge/GeneZ-v1.0.0-14b8a6?style=for-the-badge)
![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chartdotjs)
![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI%20Assistant-8E75C2?style=for-the-badge&logo=googlegemini)

GeneZ is an end-to-end, full-stack bioinformatics web platform designed for biotechnology students, researchers, and educators. It combines real-time sequence retrieval from the **National Center for Biotechnology Information (NCBI)** Entrez databases, mathematical and biochemical DNA sequence characterization, interactive comparative data visualization, and **Google Gemini AI** to deliver scientifically accurate, undergraduate-level biological explanations.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Scientific Principles & Formulas](#scientific-principles--formulas)
3. [System Architecture](#system-architecture)
4. [Project Directory Structure](#project-directory-structure)
5. [Prerequisites & Installation](#prerequisites--installation)
6. [Running the Application](#running-the-application)
7. [Configuring Google Gemini API](#configuring-google-gemini-api)
8. [Using the Web Dashboard (User Guide)](#using-the-web-dashboard-user-guide)
9. [Biotechnology Viva & Academic Presentation Guide](#biotechnology-viva--academic-presentation-guide)
10. [Automated Testing Suite](#automated-testing-suite)
11. [License](#license)

---

## Key Features

### 1. NCBI Entrez E-utilities Database Retrieval
- Real-time queries to the NCBI `nucleotide` database (`nuccore`) using `esearch`, `esummary`, and `efetch`.
- Search by **Organism name** (e.g., *Escherichia coli*, *Homo sapiens*, *Arabidopsis thaliana*) and **Gene symbol** (e.g., *lacZ*, *TP53*, *rbcL*, *ACT1*).
- Retrieves and displays:
  - Official GenBank / RefSeq Accession numbers with direct links to NCBI.
  - Gene titles, definitions, and official annotations.
  - Sequence lengths in base pairs (bp).
  - Molecule types (e.g., genomic DNA, mRNA, chloroplast DNA).
  - Cleaned DNA nucleotide sequences in standardized FASTA format.
- Includes pre-curated reference datasets for instant offline presentations and network failure resilience.

### 2. Rigorous DNA Sequence Analysis
Calculated entirely in Python using standard molecular biology formulas:
- **Total Sequence Length** (bp).
- **A, T, G, and C counts** and exact percentages.
- **GC Content (%)** and **AT Content (%)**.
- **Ambiguous IUPAC Nucleotide Handling**: Identifies and counts degenerate bases (`N`, `R`, `Y`, `S`, `W`, `K`, `M`, `B`, `D`, `H`, `V`) with full IUPAC classification.
- **Biochemical Properties**:
  - Estimated Melting Temperature ($T_m$ in °C) using Wallace Rule (oligos $<50$ bp) and Marmur-Doty equation ($>50$ bp).
  - Single-stranded DNA Molecular Weight ($MW$ in kDa).
  - Purine $(A + G)$ vs Pyrimidine $(C + T)$ ratio.
  - CpG island / dinucleotide site frequency for promoter analysis.

### 3. Comparative Multi-Sequence Analysis & Visualizations
- Side-by-side comparative table summarizing lengths, GC/AT ratios, base counts, and melting temperatures.
- **Chart.js Interactive Visualizations**:
  1. *Sequence Length Comparison* (Bar Chart).
  2. *GC% vs AT% Composition* (Grouped Bar Chart).
  3. *Nucleotide Distribution* (Adenine, Thymine, Guanine, Cytosine per record).
- **Automated Bioinformatic Observations Engine**:
  - Highlights length discrepancies (e.g., genomic CDS vs mRNA variants or partial exons).
  - Analyzes GC content variation and thermodynamic implications.
  - Flags sequencing quality and ambiguous bases.
  - **Explicit Scientific Disclaimer**: Enforces scientific integrity by warning that sequence similarity, homology, or evolutionary divergence cannot be inferred without sequence alignment (e.g., BLASTn or Clustal Omega).

### 4. Interactive Google Gemini AI Assistant
- Context-aware chatbot receiving the retrieved gene records, NCBI annotations, sequence metrics, and comparative statistics.
- Explains:
  - The biological function and metabolic/signaling pathways of the gene.
  - The encoded protein, enzyme, or structural product.
  - The biological significance of the observed GC content (e.g., thermal stability, codon bias, GC-rich isochores).
  - Structural explanations for why retrieved sequence lengths differ.
- Provides undergraduate-level scientific explanations without biological hallucinations.
- Works in **Live Gemini Mode** (with your API key) or in **Guided Educational Mode** if no key is entered.
- Safe backend handling of API keys via `.env` or the in-app settings modal.

### 5. Data Export Options
- **Download FASTA (`.fasta`)**: Multi-FASTA file formatted with canonical 60-character wrapped lines and standard NCBI headers.
- **Download CSV Report (`.csv`)**: Full tabular spreadsheet containing all accession numbers, lengths, nucleotide counts, GC/AT percentages, $T_m$, and molecular weights.

---

## Scientific Principles & Formulas

### 1. GC and AT Content
The Guanine-Cytosine content is the percentage of nitrogenous bases in a DNA molecule that are either Guanine (G) or Cytosine (C):

$$\text{GC \%} = \left( \frac{\text{Count}(G) + \text{Count}(C)}{\text{Total Sequence Length}} \right) \times 100$$

$$\text{AT \%} = \left( \frac{\text{Count}(A) + \text{Count}(T)}{\text{Total Sequence Length}} \right) \times 100$$

*Biological Importance*: G-C pairs form **three hydrogen bonds**, whereas A-T pairs form only **two hydrogen bonds**. Sequences with elevated GC content possess higher thermal denaturation thresholds, greater mechanical stiffness, and distinct codon usage patterns.

### 2. IUPAC Ambiguous Nucleotide Resolution
In Sanger or high-throughput sequencing, unresolved or polymorphic bases are represented using standard IUPAC degenerate codes:
- `N`: Any base (A, C, G, or T)
- `R`: Purine (A or G)
- `Y`: Pyrimidine (C or T)
- `S`: Strong interaction (G or C)
- `W`: Weak interaction (A or T)
- `K`: Keto (G or T)
- `M`: Amino (A or C)
- `B`: Not A (C, G, or T)
- `D`: Not C (A, G, or T)
- `H`: Not G (A, C, or T)
- `V`: Not T (A, C, or G)

GeneZ accounts for all ambiguous characters and calculates both canonical GC% and unambiguous GC%.

### 3. Estimated DNA Melting Temperature ($T_m$)
- **Wallace Rule (for oligonucleotides $< 50$ bp)**:
  $$T_m = 2 \times (A + T) + 4 \times (G + C) \quad [^\circ\text{C}]$$
- **Marmur-Doty Formula (for sequences $\ge 50$ bp at standard $50\text{ mM Na}^+$)**:
  $$T_m = 64.9 + 41 \times \left( \frac{(G + C) - 16.4}{\text{Total Length}} \right) \quad [^\circ\text{C}]$$

### 4. Molecular Weight Estimation
Estimated molecular weight of single-stranded DNA (ssDNA) in Daltons:
$$MW \approx (A \times 313.21) + (T \times 304.20) + (C \times 289.18) + (G \times 329.21) - 61.96 \quad [\text{Da}]$$

---

## System Architecture

```
[ User Browser / Client ]
           │
           ▼
[ React 18 SPA Dashboard (Tailwind CSS, Chart.js) ]
           │  REST API Calls (/api/search, /api/chat, /api/export)
           ▼
[ Flask 3.x Backend (Python 3.10+) ]
     ├── ncbi_service.py      <──>  NCBI Entrez E-utilities (REST)
     ├── analyzer_service.py   ──>  DNA Metrics & IUPAC Processing
     ├── comparative_service.py──>  Comparison Matrix & Automated Observations
     ├── gemini_service.py    <──>  Google Gemini API (gemini-2.5-flash)
     └── export_service.py     ──>  FASTA & CSV Streams
```

---

## Project Directory Structure

```
gene-z/
│
├── backend/
│   ├── app.py                     # Flask application entry point & API route handlers
│   ├── config.py                  # Configuration loader (API keys, NCBI email, ports)
│   ├── ncbi_service.py            # NCBI Entrez search (esearch, esummary, efetch) & parsing
│   ├── analyzer_service.py        # DNA nucleotide counting, GC/AT, ambiguous codes, Tm, MW
│   ├── comparative_service.py     # Comparison matrix, Chart.js payloads, observations & disclaimer
│   ├── gemini_service.py          # Google Gemini AI assistant integration with biological context
│   ├── sample_data.py             # Curated reference genes (lacZ, TP53, ACT1, rbcL) for offline/demo
│   └── export_service.py          # Multi-FASTA and CSV report export generation
│
├── frontend/
│   ├── index.html                 # Main Single Page Application shell
│   ├── package.json               # Frontend package definition
│   └── static/
│       ├── css/
│       │   └── custom.css         # Navy (#0a192f) & Teal (#14b8a6) theme, FASTA font, styling
│       └── js/
│           ├── app.js             # Root React Application state orchestrator
│           └── components/
│               ├── Navbar.js              # Header, status indicators, preset quick-pills
│               ├── SearchSection.js       # Organism & Gene inputs, record slider, custom FASTA
│               ├── ResultsOverview.js     # Top summary metrics cards and quick downloads
│               ├── NcbiSourceTable.js     # Retrieved NCBI records table with Nuccore links
│               ├── FastaViewer.js         # Interactive FASTA viewer with line numbering & copy
│               ├── SequenceMetrics.js     # Per-record composition, GC bar, IUPAC details, Tm
│               ├── ComparativeSection.js  # Comparison matrix, Chart.js graphs, observations
│               ├── GeminiChatbot.js       # Interactive Gemini AI assistant with prompt chips
│               └── ApiKeyModal.js         # In-browser Gemini API Key configuration dialog
│
├── tests/
│   └── test_backend.py            # Comprehensive 11-test automated unit and integration suite
│
├── .env                           # Local environment configuration file
├── .env.example                   # Template environment configuration file
├── requirements.txt               # Python package dependencies
├── run.py                         # One-click launcher: starts server & opens default browser
└── README.md                      # Academic documentation and project manual
```

---

## Prerequisites & Installation

### Step 1: Ensure Python is Installed
GeneZ requires **Python 3.9 or higher** (Python 3.10, 3.11, 3.12, 3.13, 3.14 supported).
Verify your Python installation in your terminal:
```bash
python --version
```

### Step 2: Clone or Navigate to the Project Folder
```bash
cd "c:\Users\rishi\OneDrive\Desktop\gene-z"
```

### Step 3: (Recommended) Create a Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 4: Install Dependencies
```bash
pip install -r requirements.txt
```
The installed packages include:
- `flask`: Lightweight Python web server.
- `flask-cors`: Cross-Origin Resource Sharing.
- `biopython`: Standard bioinformatics computation library.
- `requests`: HTTP client for querying NCBI Entrez E-utilities.
- `python-dotenv`: Environment variable loader.
- `google-genai` & `google-generativeai`: Google Gemini AI SDKs.

---

## Running the Application

### Option A: One-Click Launcher (Recommended)
Run the launcher script from the project root:
```bash
python run.py
```
This automatically initializes the Flask backend and opens the dashboard in your default browser at `http://127.0.0.1:5000`.

### Option B: Direct Flask Startup
```bash
python backend/app.py
```
Then open your web browser and navigate to:
**`http://127.0.0.1:5000`**

---

## Configuring Google Gemini API

GeneZ integrates with Google's Gemini models (such as `gemini-2.5-flash` or `gemini-1.5-flash`).

### 1. Get a Free Gemini API Key
Visit **[Google AI Studio](https://aistudio.google.com/app/apikey)** and generate a free API key.

### 2. Enter the Key (Choose Either Method):
- **Method 1: In the `.env` file** (Permanent)
  Open `.env` in any text editor and paste your key:
  ```env
  GEMINI_API_KEY=AIzaSyYourActualKeyHere
  ```
- **Method 2: Directly via the Web Dashboard** (Instant)
  Click the **Gemini AI: Educational Mode** button in the top navigation bar of the GeneZ website, paste your key into the dialog, and click **Save Key**.

*Note: If you do not enter an API key, GeneZ will automatically operate in **Educational / Guided Simulation Mode**, providing structured biological explanations so you can demonstrate the application without any setup!*

---

## Using the Web Dashboard (User Guide)

1. **Quick Demos**:
   Click any of the preset pills in the navigation bar to instantly load and analyze verified reference genes:
   - *E. coli - lacZ*
   - *H. sapiens - TP53*
   - *S. cerevisiae - ACT1*
   - *A. thaliana - rbcL*

2. **Custom Search**:
   - Enter the **Organism Name** (e.g., `Homo sapiens`).
   - Enter the **Gene Symbol** (e.g., `BRCA1`, `INS`, `GAPDH`).
   - Select the number of records (1 to 5).
   - Click **Retrieve & Analyze Sequence**.

3. **Explore Results**:
   - **NCBI Sequence Sources**: Click any row in the source table to load that sequence into the FASTA viewer and individual metrics panel.
   - **FASTA Explorer**: Search for specific motifs (e.g., `ATG` start codons, restriction enzyme recognition sites), toggle base syntax highlighting, copy the FASTA sequence to clipboard, or download the `.fasta` file.
   - **Sequence Metrics**: View exact counts of A, T, G, C, ambiguous IUPAC bases, estimated melting temperature ($T_m$), and molecular weight.
   - **Comparative Section**: Compare sequence lengths and GC/AT content across records using the Chart.js visualizations.
   - **Automated Observations**: Read the automatically generated comparative notes and review the scientific methodology disclaimer.
   - **Gemini AI Assistant**: Click any of the suggested prompt chips or type your own question to ask Gemini about gene function, metabolic pathways, or protein structure.

---

## Biotechnology Viva & Academic Presentation Guide

Here are key questions and answers commonly asked by examiners during college project evaluations:

### Q1: What is the purpose of GeneZ?
> **Answer**: GeneZ bridges biological sequence retrieval with automated computational analysis and AI interpretation. It retrieves verified nucleotide records from the NCBI database, computes compositional metrics (GC%, AT%, base counts, melting temperature, molecular weight), compares multiple isoforms or fragments, and uses Google's Gemini AI to explain the underlying biology to undergraduate students.

### Q2: Why is GC content biologically significant?
> **Answer**: Guanine and Cytosine pair with **three hydrogen bonds**, compared to only **two** between Adenine and Thymine. Consequently, DNA with higher GC content is more thermally and mechanically stable. Furthermore, GC content correlates with genomic isochores, codon bias, translation efficiency, and PCR annealing requirements.

### Q3: How does GeneZ handle ambiguous nucleotides?
> **Answer**: Unresolved sequencing positions or polymorphisms are encoded using standard IUPAC degenerate symbols (such as `N` for any base, `R` for purines, `Y` for pyrimidines). GeneZ detects these characters, provides their biochemical definition, and calculates both overall GC% and canonical unambiguous GC% without crashing.

### Q4: Why can't we claim evolutionary homology directly from sequence length or GC content?
> **Answer**: Two completely unrelated sequences from different organisms can happen to share identical GC percentages (e.g., 52%) and lengths. True homology and evolutionary distance require a pairwise or multiple sequence alignment algorithm (such as BLASTn, Needleman-Wunsch, or Clustal Omega) to identify positional conservation and alignment score. GeneZ explicitly displays this scientific disclaimer to maintain methodological rigor.

### Q5: How are NCBI records retrieved?
> **Answer**: GeneZ uses NCBI Entrez E-utilities (specifically `esearch.fcgi` to locate Unique Identifiers, `esummary.fcgi` to gather annotations, and `efetch.fcgi` in `rettype=fasta` to stream raw FASTA nucleotide data).

---

## Automated Testing Suite

GeneZ includes a full unit and integration test suite covering sequence cleaning, IUPAC parsing, biochemical formulas, comparative statistics, export formatting, and REST API routes.

Run the test suite:
```bash
python -m unittest tests/test_backend.py
```

Expected output:
```
...........
----------------------------------------------------------------------
Ran 11 tests in 0.20s

OK
```

---

## License

This project is developed for educational, academic, and biotechnology research purposes. Code is licensed under the MIT License.

