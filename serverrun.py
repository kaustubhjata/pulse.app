import subprocess
import os
import sys

# --- CORRECTED CODE ---

# Define the path to the DIRECTORY where your scripts are
model_directory = r"C:\Users\laksh\Downloads\vnr hackathon\PULSE\model"

# The commands to run are already correct
backend_cmd = ["python", "app.py"]
frontend_cmd = ["node", "server.js"]

print("🚀 Starting both servers...\n")

# Start backend server
print(f"Starting backend in directory: '{model_directory}'")
backend_proc = subprocess.Popen(
    backend_cmd,
    cwd=model_directory,  # <-- Use the directory path here
    stdout=sys.stdout,
    stderr=sys.stderr,
    # shell=True is not needed when the command is a list
)

# Start frontend server
print(f"Starting frontend in directory: '{model_directory}'")
frontend_proc = subprocess.Popen(
    frontend_cmd,
    cwd=model_directory,  # <-- Use the same directory path here
    stdout=sys.stdout,
    stderr=sys.stderr,
    # shell=True is not needed here either
)

try:
    # Wait for both processes to finish
    backend_proc.wait()
    frontend_proc.wait()
except KeyboardInterrupt:
    print("\n🛑 Stopping servers...")
    backend_proc.terminate()
    frontend_proc.terminate()
    print("✅ Both servers stopped.")