"""
Tarot Bot Server Management Script

This script provides commands to start, stop, and check the status of the tarot bot server.
It helps users manage the server without needing to use the command line directly.
"""

import os
import sys
import time
import subprocess
import requests
import signal
import psutil
from dotenv import load_dotenv
from tarot_bot import app

# Constants
SERVER_PORT = 5000
SERVER_URL = f"http://localhost:{SERVER_PORT}/api/tarot-reading"
PID_FILE = ".server_pid.txt"

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import psutil
        import requests
        import dotenv
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Please install required packages with: pip install psutil requests python-dotenv")
        return False

def is_server_running():
    """Check if the server is running by making a request to the health check endpoint"""
    try:
        response = requests.head(SERVER_URL, timeout=2)
        return response.status_code != 404
    except requests.exceptions.RequestException:
        return False

def find_server_process():
    """Find the server process by checking running Python processes"""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = proc.info.get('cmdline', [])
            if cmdline and len(cmdline) > 1:
                if 'python' in cmdline[0].lower() and 'manage_server.py' in cmdline[1]:
                    if len(cmdline) > 2 and cmdline[2] == 'start':
                        return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return None

def save_pid(pid):
    """Save the server process ID to a file"""
    with open(PID_FILE, 'w') as f:
        f.write(str(pid))

def load_pid():
    """Load the server process ID from a file"""
    if os.path.exists(PID_FILE):
        with open(PID_FILE, 'r') as f:
            try:
                return int(f.read().strip())
            except ValueError:
                return None
    return None

def start_server():
    """Start the tarot bot server"""
    if is_server_running():
        print("Server is already running!")
        return

    if not os.path.exists('.env'):
        print("WARNING: .env file not found. Creating one...")
        with open('.env', 'w') as f:
            f.write("# Google Gemini API Key\nGEMINI_API_KEY=\n")
        print("Please edit the .env file and add your Gemini API key.")
        return

    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("WARNING: GEMINI_API_KEY not found in .env file. Please add it.")
        return

    print("Starting Tarot Bot server...")

    if os.name == 'nt':  # Windows
        process = subprocess.Popen(
            ['python', 'manage_server.py', 'start', 'direct'],
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:  # Unix/Linux/Mac
        process = subprocess.Popen(
            ['python', 'manage_server.py', 'start', 'direct'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            start_new_session=True
        )

    save_pid(process.pid)

    print("Waiting for server to start...")
    for _ in range(10):
        if is_server_running():
            print(f"Server started successfully! Running on http://localhost:{SERVER_PORT}")
            return
        time.sleep(1)

    print("Server may not have started properly. Please check for errors.")

def stop_server():
    """Stop the tarot bot server"""
    pid = load_pid()
    if pid:
        try:
            process = psutil.Process(pid)
            process.terminate()
            print(f"Server process (PID: {pid}) terminated.")
            os.remove(PID_FILE)
            return
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            print(f"Could not terminate process with PID {pid}.")

    process = find_server_process()
    if process:
        try:
            process.terminate()
            print(f"Server process (PID: {process.pid}) terminated.")
            return
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            print(f"Could not terminate process with PID {process.pid}.")

    print("No running server process found.")

def check_status():
    """Check the status of the tarot bot server"""
    if is_server_running():
        print("Server is running!")
        process = find_server_process()
        if process:
            print(f"Process ID: {process.pid}")
            print(f"Running for: {time.time() - process.create_time():.1f} seconds")
        return True
    else:
        print("Server is not running.")
        return False

def print_help():
    """Print help information"""
    print("Tarot Bot Server Management Script")
    print("----------------------------------")
    print("Commands:")
    print("  start   - Start the tarot bot server in the background")
    print("  run     - Run the tarot bot server in the current terminal")
    print("  stop    - Stop the tarot bot server")
    print("  status  - Check if the server is running")
    print("  restart - Restart the tarot bot server")
    print("  help    - Show this help message")

def run_server_directly():
    """Run the Flask server directly in the current process"""
    print("Starting Tarot Bot API server...")

    if not os.path.exists('.env'):
        print("WARNING: .env file not found. Please create one with your GEMINI_API_KEY.")
    else:
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found in .env file. Please add it.")
        else:
            print("GEMINI_API_KEY found in .env file.")

    print("Server will run on http://localhost:5000")
    print("Press CTRL+C to stop the server")

    app.run(debug=True, port=SERVER_PORT)

def main():
    """Main function to parse command line arguments and execute commands"""
    if not check_dependencies():
        return

    if len(sys.argv) < 2:
        print_help()
        return

    command = sys.argv[1].lower()

    if command == "start":
        if len(sys.argv) > 2 and sys.argv[2] == "direct":
            run_server_directly()
        else:
            start_server()
    elif command == "stop":
        stop_server()
    elif command == "status":
        check_status()
    elif command == "restart":
        stop_server()
        time.sleep(2)
        start_server()
    elif command == "run":
        run_server_directly()
    elif command == "help":
        print_help()
    else:
        print(f"Unknown command: {command}")
        print_help()

if __name__ == "__main__":
    main()
