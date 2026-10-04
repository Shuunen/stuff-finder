import http.server, sys
from pathlib import Path
SP=str(Path(__file__).resolve().parents[2]/'.local')+'/'
class H(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        n=int(self.headers.get('content-length',0)); b=self.rfile.read(n)
        open(SP+'dump/'+(self.path.strip('/') or 'root')+'.txt','wb').write(b)
        self.send_response(200); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers(); self.wfile.write(b'ok')
    def do_OPTIONS(self):
        self.send_response(204); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Headers','*'); self.end_headers()
    def log_message(self,*a): pass
http.server.HTTPServer(('127.0.0.1',5055),H).serve_forever()
