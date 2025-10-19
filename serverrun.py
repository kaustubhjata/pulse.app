import subprocess
import os
import sys

# Define paths
backend_dir = r"C:\Users\laksh\Pictures\sunsleepers\HC_06\model"
frontend_dir = r"C:\Users\laksh\Pictures\sunsleepers\HC_06\frontend"

# Define commands
backend_cmd = ["python", "app.py"]
frontend_cmd = ["node", "server.js"]

print("🚀 Starting both servers...\n")

# Start backend and frontend concurrently, outputting to the same terminal
backend_proc = subprocess.Popen(
    backend_cmd,
    cwd=backend_dir,
    stdout=sys.stdout,
    stderr=sys.stderr,
    shell=True
)

frontend_proc = subprocess.Popen(
    frontend_cmd,
    cwd=frontend_dir,
    stdout=sys.stdout,
    stderr=sys.stderr,
    shell=True
)

try:
    # Wait for both processes to finish (blocks until both end)
    backend_proc.wait()
    frontend_proc.wait()
except KeyboardInterrupt:
    print("\n🛑 Stopping servers...")
    backend_proc.terminate()
    frontend_proc.terminate()
    print("✅ Both servers stopped.")
