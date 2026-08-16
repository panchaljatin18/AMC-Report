import pandas as pd
from pathlib import Path

def generate_sample_excels(output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Road.xlsx
    road_data = [
        {"Zone": "NORTH WEST", "Problem": "Road-Repair Require", "Closed": 120, "Open": 35, "Grand Total": 155},
        {"Zone": "NORTH WEST", "Problem": "Road-Bhuva On Road", "Closed": 45, "Open": 12, "Grand Total": 57},
        {"Zone": "NORTH WEST", "Problem": "Road-Footpath Repairing", "Closed": 30, "Open": 8, "Grand Total": 38},
        {"Zone": "WEST", "Problem": "Road-Repair Require", "Closed": 210, "Open": 65, "Grand Total": 275},
        {"Zone": "WEST", "Problem": "Road-Bhuva On Road", "Closed": 80, "Open": 24, "Grand Total": 104},
        {"Zone": "WEST", "Problem": "Road-Footpath Repairing", "Closed": 55, "Open": 15, "Grand Total": 70},
        {"Zone": "SOUTH", "Problem": "Road-Repair Require", "Closed": 180, "Open": 42, "Grand Total": 222},
        {"Zone": "SOUTH", "Problem": "Road-Bhuva On Road", "Closed": 60, "Open": 18, "Grand Total": 78},
        {"Zone": "SOUTH", "Problem": "Road-Footpath Repairing", "Closed": 40, "Open": 10, "Grand Total": 50},
        {"Zone": "SOUTH WEST", "Problem": "Road-Repair Require", "Closed": 140, "Open": 38, "Grand Total": 178},
        {"Zone": "SOUTH WEST", "Problem": "Road-Bhuva On Road", "Closed": 50, "Open": 14, "Grand Total": 64},
        {"Zone": "SOUTH WEST", "Problem": "Road-Footpath Repairing", "Closed": 35, "Open": 9, "Grand Total": 44},
        {"Zone": "NORTH", "Problem": "Road-Repair Require", "Closed": 190, "Open": 50, "Grand Total": 240},
        {"Zone": "NORTH", "Problem": "Road-Bhuva On Road", "Closed": 70, "Open": 20, "Grand Total": 90},
        {"Zone": "NORTH", "Problem": "Road-Footpath Repairing", "Closed": 45, "Open": 12, "Grand Total": 57},
        {"Zone": "CENTRAL", "Problem": "Road-Repair Require", "Closed": 230, "Open": 75, "Grand Total": 305},
        {"Zone": "CENTRAL", "Problem": "Road-Bhuva On Road", "Closed": 95, "Open": 30, "Grand Total": 125},
        {"Zone": "CENTRAL", "Problem": "Road-Footpath Repairing", "Closed": 60, "Open": 18, "Grand Total": 78},
        {"Zone": "EAST", "Problem": "Road-Repair Require", "Closed": 160, "Open": 48, "Grand Total": 208},
        {"Zone": "EAST", "Problem": "Road-Bhuva On Road", "Closed": 55, "Open": 16, "Grand Total": 71},
        {"Zone": "EAST", "Problem": "Road-Footpath Repairing", "Closed": 38, "Open": 11, "Grand Total": 49},
    ]
    road_df = pd.DataFrame(road_data)
    road_file = output_dir / "Road.xlsx"
    with pd.ExcelWriter(road_file, engine="openpyxl") as writer:
        road_df.to_excel(writer, sheet_name="road 1", index=False)

    # 2. Drainage.xlsx
    drainage_data = [
        {"Zone": "NORTH WEST", "Problem": "Choking Of Line", "Closed": 310, "Open": 85, "Grand Total": 395},
        {"Zone": "NORTH WEST", "Problem": "Manhole Cover Missing", "Closed": 45, "Open": 14, "Grand Total": 59},
        {"Zone": "NORTH WEST", "Problem": "Public Toilets/Urinals", "Closed": 28, "Open": 9, "Grand Total": 37},
        {"Zone": "NORTH WEST", "Problem": "Other", "Closed": 65, "Open": 18, "Grand Total": 83},
        
        {"Zone": "WEST", "Problem": "Choking Of Line", "Closed": 450, "Open": 140, "Grand Total": 590},
        {"Zone": "WEST", "Problem": "Manhole Cover Missing", "Closed": 80, "Open": 28, "Grand Total": 108},
        {"Zone": "WEST", "Problem": "Public Toilets/Urinals", "Closed": 40, "Open": 15, "Grand Total": 55},
        {"Zone": "WEST", "Problem": "Other", "Closed": 90, "Open": 32, "Grand Total": 122},

        {"Zone": "SOUTH", "Problem": "Choking Of Line", "Closed": 280, "Open": 70, "Grand Total": 350},
        {"Zone": "SOUTH", "Problem": "Manhole Cover Missing", "Closed": 50, "Open": 12, "Grand Total": 62},
        {"Zone": "SOUTH", "Problem": "Public Toilets/Urinals", "Closed": 30, "Open": 8, "Grand Total": 38},
        {"Zone": "SOUTH", "Problem": "Other", "Closed": 55, "Open": 14, "Grand Total": 69},

        {"Zone": "SOUTH WEST", "Problem": "Choking Of Line", "Closed": 240, "Open": 60, "Grand Total": 300},
        {"Zone": "SOUTH WEST", "Problem": "Manhole Cover Missing", "Closed": 40, "Open": 10, "Grand Total": 50},
        {"Zone": "SOUTH WEST", "Problem": "Public Toilets/Urinals", "Closed": 22, "Open": 6, "Grand Total": 28},
        {"Zone": "SOUTH WEST", "Problem": "Other", "Closed": 48, "Open": 12, "Grand Total": 60},

        {"Zone": "NORTH", "Problem": "Choking Of Line", "Closed": 380, "Open": 110, "Grand Total": 490},
        {"Zone": "NORTH", "Problem": "Manhole Cover Missing", "Closed": 65, "Open": 22, "Grand Total": 87},
        {"Zone": "NORTH", "Problem": "Public Toilets/Urinals", "Closed": 35, "Open": 11, "Grand Total": 46},
        {"Zone": "NORTH", "Problem": "Other", "Closed": 75, "Open": 25, "Grand Total": 100},

        {"Zone": "CENTRAL", "Problem": "Choking Of Line", "Closed": 490, "Open": 165, "Grand Total": 655},
        {"Zone": "CENTRAL", "Problem": "Manhole Cover Missing", "Closed": 95, "Open": 35, "Grand Total": 130},
        {"Zone": "CENTRAL", "Problem": "Public Toilets/Urinals", "Closed": 50, "Open": 18, "Grand Total": 68},
        {"Zone": "CENTRAL", "Problem": "Other", "Closed": 110, "Open": 40, "Grand Total": 150},

        {"Zone": "EAST", "Problem": "Choking Of Line", "Closed": 330, "Open": 95, "Grand Total": 425},
        {"Zone": "EAST", "Problem": "Manhole Cover Missing", "Closed": 55, "Open": 16, "Grand Total": 71},
        {"Zone": "EAST", "Problem": "Public Toilets/Urinals", "Closed": 32, "Open": 10, "Grand Total": 42},
        {"Zone": "EAST", "Problem": "Other", "Closed": 60, "Open": 20, "Grand Total": 80},
    ]
    drainage_df = pd.DataFrame(drainage_data)
    drainage_file = output_dir / "Drainage.xlsx"
    with pd.ExcelWriter(drainage_file, engine="openpyxl") as writer:
        drainage_df.to_excel(writer, sheet_name="DRAINAGE", index=False)

    # 3. Water.xlsx
    water_data = [
        {"Zone": "NORTH WEST", "No Supply": 25, "Leakage": 42, "Pollution": 18, "Low Pressure": 30, "Tanker": 12, "Other": 8, "Total Open": 135},
        {"Zone": "WEST", "No Supply": 40, "Leakage": 68, "Pollution": 32, "Low Pressure": 55, "Tanker": 25, "Other": 15, "Total Open": 235},
        {"Zone": "SOUTH", "No Supply": 20, "Leakage": 35, "Pollution": 14, "Low Pressure": 28, "Tanker": 10, "Other": 6, "Total Open": 113},
        {"Zone": "SOUTH WEST", "No Supply": 18, "Leakage": 30, "Pollution": 12, "Low Pressure": 22, "Tanker": 8, "Other": 5, "Total Open": 95},
        {"Zone": "NORTH", "No Supply": 32, "Leakage": 54, "Pollution": 24, "Low Pressure": 45, "Tanker": 18, "Other": 12, "Total Open": 185},
        {"Zone": "CENTRAL", "No Supply": 55, "Leakage": 85, "Pollution": 45, "Low Pressure": 70, "Tanker": 30, "Other": 20, "Total Open": 305},
        {"Zone": "EAST", "No Supply": 28, "Leakage": 48, "Pollution": 20, "Low Pressure": 38, "Tanker": 15, "Other": 9, "Total Open": 158},
    ]
    water_df = pd.DataFrame(water_data)
    water_file = output_dir / "Water.xlsx"
    with pd.ExcelWriter(water_file, engine="openpyxl") as writer:
        water_df.to_excel(writer, sheet_name="water1", index=False)

    return {
        "road": road_file,
        "drainage": drainage_file,
        "water": water_file
    }
