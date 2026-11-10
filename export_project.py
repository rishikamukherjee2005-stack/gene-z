"""
Helper script to package the GeneZ project into a clean .zip file for submission.
Excludes virtual environments, pycache, and private .env files (retains .env.example).
"""

import os
import zipfile

def create_submission_zip(output_filename="GeneZ_Project_Submission.zip"):
    root_dir = os.path.dirname(os.path.abspath(__file__))
    zip_path = os.path.join(root_dir, output_filename)

    # Folders and files to exclude
    exclude_dirs = {"__pycache__", "venv", ".venv", "env", ".git", ".idea", ".vscode"}
    exclude_files = {".env", output_filename, "GeneZ_Project_Submission.zip"}

    print(f"Creating clean project archive: {output_filename}...")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for foldername, subfolders, filenames in os.walk(root_dir):
            # Prune excluded directories
            subfolders[:] = [d for d in subfolders if d not in exclude_dirs]

            for filename in filenames:
                if filename in exclude_files:
                    continue
                if filename.endswith(".pyc"):
                    continue

                filepath = os.path.join(foldername, filename)
                arcname = os.path.relpath(filepath, root_dir)
                zipf.write(filepath, arcname)
                print(f"  + Added: {arcname}")

    print(f"\n[Success] Clean submission package created: {zip_path}")
    print("This file is ready to email or upload to your college portal!")

if __name__ == "__main__":
    create_submission_zip()

