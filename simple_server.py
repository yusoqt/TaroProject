"""
Simple HTTP Server for Tarot Project

This script starts a simple HTTP server to serve the tarot project files.
This helps avoid CORS issues when making requests to the tarot bot API.
"""

import http.server
import socketserver
import os
import webbrowser

# Configuration
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Custom logging to make it more user-friendly
        if len(args) >= 3:
            print(f"[Web Server] {args[0]} {args[1]} {args[2]}")
        else:
            # Fall back to the original format if we don't have enough args
            print(f"[Web Server] {format % args}")

def start_server():
    """Start the HTTP server and open the browser"""

    handler = MyHttpRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print(f"Opening browser to http://localhost:{PORT}/index.html")

        webbrowser.open(f"http://localhost:{PORT}/index.html")

        print("Server is running. Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    start_server()
