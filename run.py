"""
AI Career Advisor - Unified Launcher & Process Supervisor
Ensures the server starts cleanly, monitors health, and opens the browser.
"""

import os
import sys
import time
import socket
import subprocess
import urllib.request
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
PORT = 8000
HEALTH_URL = f"http://127.0.0.1:{PORT}/health"
APP_URL = f"http://localhost:{PORT}"


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def kill_port_owner(port: int):
    """Frees the port if an orphaned process is holding it on Windows."""
    if sys.platform != "win32":
        return
    try:
        cmd = f'netstat -ano | findstr ":{port} "'
        output = subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.DEVNULL)
        pids = set()
        for line in output.strip().splitlines():
            parts = line.split()
            if len(parts) >= 5 and "LISTENING" in parts:
                pids.add(parts[-1])
        current_pid = str(os.getpid())
        for pid in pids:
            if pid != current_pid and pid != "0":
                print(f"[Cleanup] Terminating stale process PID {pid} on port {port}...")
                subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
        time.sleep(1)
    except Exception:
        pass


def wait_for_server(timeout: float = 12.0) -> bool:
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with urllib.request.urlopen(HEALTH_URL, timeout=1.0) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.5)
    return False


def main():
    print("=" * 50)
    print("       AI Career Advisor - System Launcher       ")
    print("=" * 50)

    # 1. Verify dependencies
    print("\n[1/3] Checking environment...")
    try:
        import fastapi
        import uvicorn
        print("  ✓ Python & core dependencies verified.")
    except ImportError:
        print("  ! Installing required dependencies...")
        req_path = BACKEND_DIR / "requirements.txt"
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(req_path)])

    # 2. Check and clean port 8000
    if is_port_in_use(PORT):
        print(f"  ! Port {PORT} is occupied. Cleaning up...")
        kill_port_owner(PORT)

    # 3. Start server with supervisor loop
    print(f"\n[2/3] Starting backend server on port {PORT}...")
    server_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        str(PORT),
    ]

    browser_opened = False

    while True:
        process = subprocess.Popen(
            server_cmd,
            cwd=str(BACKEND_DIR),
        )

        # Wait for server to come online
        if not browser_opened:
            print("[3/3] Waiting for AI engine initialization...")
            if wait_for_server():
                print(f"\n  ✓ AI Career Advisor is ONLINE at {APP_URL}")
                print(f"  ✓ API Docs available at {APP_URL}/docs")
                print("  ✓ Opening application in your browser...")
                webbrowser.open(APP_URL)
                browser_opened = True
            else:
                print("  ! Server started, opening browser anyway...")
                webbrowser.open(APP_URL)
                browser_opened = True

        print("\n[Status] Server running. Press Ctrl+C in this window to stop.\n")

        try:
            return_code = process.wait()
        except KeyboardInterrupt:
            print("\nShutting down AI Career Advisor...")
            process.terminate()
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill()
            print("Server stopped cleanly.")
            break

        if return_code != 0:
            print(f"\n[Warning] Server process exited with code {return_code}.")
            print("Restarting server in 2 seconds...")
            time.sleep(2)
        else:
            print("Server closed.")
            break


if __name__ == "__main__":
    main()
