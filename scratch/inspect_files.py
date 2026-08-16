import pandas as pd
from pathlib import Path

upload_dir = Path("c:/Users/Jmpan/OneDrive/Desktop/AMC CRM/backend/uploads/bedef3ac")
for f in upload_dir.glob("*.xlsx"):
    print("=" * 60)
    print("FILE:", f.name)
    try:
        excel = pd.ExcelFile(f)
        print("Sheets:", excel.sheet_names)
        for s in excel.sheet_names:
            print(f"--- Sheet: {s} ---")
            df = pd.read_excel(f, sheet_name=s, header=None)
            print(df.head(10))
    except Exception as e:
        print("ERROR:", e)
