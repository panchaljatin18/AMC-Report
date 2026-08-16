import pandas as pd
from pathlib import Path

upload_dir = Path("c:/Users/Jmpan/OneDrive/Desktop/AMC CRM/backend/uploads/bedef3ac")
for f in sorted(list(upload_dir.glob("*.xlsx"))):
    print("=" * 70)
    print("FILE:", f.name)
    xl = pd.ExcelFile(f)
    print("Sheets:", xl.sheet_names)
    for sheet in xl.sheet_names:
        if sheet in ["road", "DRAINAGE", "water", "WATER", "road", "Drainage"]:
            print(f"\n--- Sheet: '{sheet}' ---")
            df = pd.read_excel(f, sheet_name=sheet, header=None)
            for i in range(min(20, len(df))):
                row_vals = [str(x).strip() if pd.notnull(x) else "" for x in df.iloc[i].values]
                non_empty = [v for v in row_vals if v != ""]
                if non_empty:
                    print(f"Row {i:2d}:", non_empty[:8])
