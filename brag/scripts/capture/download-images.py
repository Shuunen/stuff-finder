"""Downloads the photos listed in .local/dump/imgs.txt into .local/dump/imgs/<index>.bin"""
import json
import subprocess
from pathlib import Path

dump = Path(__file__).resolve().parents[2] / '.local' / 'dump'
(dump / 'imgs').mkdir(exist_ok=True)
for img in json.load(open(dump / 'imgs.txt')):
    subprocess.run(['curl', '-s', '-o', str(dump / 'imgs' / f'{img["i"]}.bin'), img['src']], check=True)
    print('ok', img['i'])
