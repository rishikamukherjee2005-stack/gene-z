"""
GeneZ - One-Click Application Launcher
Launches the Flask backend server and automatically opens the dashboard in your default browser.
"""

import sys
import os
import time
import webbrowser
import threading

# Add backend directory to Python path
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, BACKEND_DIR)

from app import app
from config import Config

def open_browser():
    """Wait briefly for Flask to initialize, then launch the browser."""
    time.sleep(1.2)
    url = f"http://{Config.HOST}:{Config.PORT}"
    print(f"\n[GeneZ] Opening dashboard in your default browser: {url}\n")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"[GeneZ] Note: Could not auto-launch browser ({e}). Please manually open: {url}")

if __name__ == "__main__":
    print("=" * 65)
    print("   GENEZ: AI-POWERED GENE SEQUENCE RETRIEVAL & ANALYSIS TOOL")
    print("   Biotechnology & Bioinformatics Academic Platform")
    print("=" * 65)
    print(f" * Backend Server: http://{Config.HOST}:{Config.PORT}")
    print(f" * Gemini API Status: {'Configured' if Config.GEMINI_API_KEY else 'Educational/Simulation Mode (add key in .env or UI)'}")
    print(f" * NCBI E-utilities: Configured (Email: {Config.NCBI_EMAIL})")
    print("=" * 65)
    
    # Start browser opener in background thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Start Flask
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)

