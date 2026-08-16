import pandas as pd
from pathlib import Path

f_water = Path("c:/Users/Jmpan/OneDrive/Desktop/AMC CRM/backend/uploads/bedef3ac/11-08-2026 2 PM CCRS REPORT-Water.xlsx")
xl = pd.ExcelFile(f_water)
print("Water file sheets:", xl.sheet_names)

for sheet in xl.sheet_names:
    if "water" in sheet.lower():
        print(f"\n================ SHEET: {sheet} ================")
        df = pd.read_excel(f_water, sheet_name=sheet, header=None)
        print("DF Shape:", df.shape)
        for i in range(min(20, len(df))):
            row_str = [str(x) if pd.notnull(x) else "" for x in df.iloc[i].values]
            if any(row_str):
                print(f"Row {i:2d}:", [x for x in row_str if x != ""][:8])
