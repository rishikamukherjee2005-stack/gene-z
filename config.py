import os
from dotenv import load_dotenv

# Load environment variables from .env file
root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
if os.path.exists(root_env):
    load_dotenv(root_env)
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "genez-secret-key-bioinformatics-2026")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    NCBI_EMAIL = os.getenv("NCBI_EMAIL", "genez.bioinformatics@example.edu")
    NCBI_API_KEY = os.getenv("NCBI_API_KEY", "")  # Optional NCBI API key for higher rate limits
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "t")
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "127.0.0.1")

