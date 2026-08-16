import urllib.request
import json
from pathlib import Path
import os

upload_dir = Path("c:/Users/Jmpan/OneDrive/Desktop/AMC CRM/backend/uploads/bedef3ac")
f_road = upload_dir / "11-08-2026 2 PM CCRS REPORT-Road.xlsx"
f_drainage = upload_dir / "11-08-2026 2 PM CCRS REPORT-Drainage.xlsx"
f_water = upload_dir / "11-08-2026 2 PM CCRS REPORT-Water.xlsx"

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = []

def add_file(name, filepath, filename):
    body.append(f'--{boundary}'.encode('utf-8'))
    body.append(f'Content-Disposition: form-data; name="{name}"; filename="{filename}"'.encode('utf-8'))
    body.append(b'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    body.append(b'')
    with open(filepath, 'rb') as f:
        body.append(f.read())

def add_field(name, value):
    body.append(f'--{boundary}'.encode('utf-8'))
    body.append(f'Content-Disposition: form-data; name="{name}"'.encode('utf-8'))
    body.append(b'')
    body.append(value.encode('utf-8'))

add_file('road_file', f_road, 'Road.xlsx')
add_file('drainage_file', f_drainage, 'Drainage.xlsx')
add_file('water_file', f_water, 'Water.xlsx')
add_field('date_range', 'August 2026')
body.append(f'--{boundary}--'.encode('utf-8'))
body.append(b'')

payload = b'\r\n'.join(body)

req = urllib.request.Request(
    'http://localhost:8000/api/reports/generate',
    data=payload,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)

try:
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        print("STATUS 200 OK SUCCESS!")
        print("Report ID:", res_data.get("report_id"))
        print("Warnings:", res_data.get("warnings"))
        print("Road Grand Total:", res_data.get("road_stats", {}).get("grand_total"))
        print("Drainage Grand Total:", res_data.get("drainage_stats", {}).get("grand_total"))
        print("Water Total Open:", res_data.get("water_stats", {}).get("total_open"))
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print("RESPONSE:", e.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", e)
