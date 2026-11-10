"""
Vercel Serverless Entry Point for GeneZ.
Exposes the Flask WSGI application instance for Vercel's Python runtime.
"""

import sys
import os

# Add backend directory to sys.path so all imports (config, ncbi_service, etc.) resolve cleanly
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(project_root, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app

# Vercel's Python runtime expects 'app'

