import pandas as pd
from pathlib import Path

upload_dir = Path("c:/Users/Jmpan/OneDrive/Desktop/AMC CRM/backend/uploads/bedef3ac")
for f in upload_dir.glob("*.xlsx"):
    print("==================================================")
    print("FILE:", f.name)
    xl = pd.ExcelFile(f)
    print("Sheets:", xl.sheet_names)
    for sheet in ["road", "DRAINAGE", "water"]:
        if sheet in xl.sheet_names:
            print(f"\n--- INSPECTING SHEET: '{sheet}' in {f.name} ---")
            df = pd.read_excel(f, sheet_name=sheet, header=None)
            print("Shape:", df.shape)
            print("First 15 rows raw:")
            for r_idx in range(min(15, len(df))):
                row_vals = [str(x) if pd.notnull(x) else "" for x in df.iloc[r_idx].values]
                print(f"Row {r_idx}:", row_vals[:8])
