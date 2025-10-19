import subprocess
import os
import sys

# Define paths
chatroomserver = r"HC_06\model\app.py"
moodserver = r"HC_06\model\server.js"

# Define commands
backend_cmd = ["python", "app.py"]
frontend_cmd = ["node", "server.js"]

print("🚀 Starting both servers...\n")

# Start backend and frontend concurrently, outputting to the same terminal
backend_proc = subprocess.Popen(
    backend_cmd,
    cwd=chatroomserver,
    stdout=sys.stdout,
    stderr=sys.stderr,
    shell=True
)

frontend_proc = subprocess.Popen(
    frontend_cmd,
    cwd=moodserver,
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
