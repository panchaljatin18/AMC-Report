from typing import List, Dict, Any

def validate_road_data(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    warnings = []
    validated_rows = []
    
    # Track duplicates
    seen = {}
    
    for row in rows:
        r_idx = row.get("row_index", 0)
        zone = row.get("zone", "")
        problem = row.get("problem", "")
        closed = row.get("closed", 0)
        open_cnt = row.get("open", 0)
        grand_total = row.get("grand_total", 0)

        # Row math check
        if closed + open_cnt != grand_total:
            warnings.append(
                f"Road Row {r_idx} ({zone} - {problem}): Math mismatch! Closed ({closed}) + Open ({open_cnt}) = {closed + open_cnt}, but Grand Total is {grand_total}."
            )

        key = (zone.upper(), problem.upper())
        if key in seen:
            warnings.append(
                f"Road Row {r_idx}: Duplicate entry found for Zone '{zone}' and Problem '{problem}'. Auto-merging counts."
            )
            existing = seen[key]
            existing["closed"] += closed
            existing["open"] += open_cnt
            existing["grand_total"] += grand_total
        else:
            new_row = dict(row)
            seen[key] = new_row
            validated_rows.append(new_row)

    return {
        "valid": len(warnings) == 0,
        "warnings": warnings,
        "rows": validated_rows
    }


def validate_drainage_data(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    warnings = []
    validated_rows = []
    seen = {}

    for row in rows:
        r_idx = row.get("row_index", 0)
        zone = row.get("zone", "")
        problem = row.get("problem", "")
        closed = row.get("closed", 0)
        open_cnt = row.get("open", 0)
        grand_total = row.get("grand_total", 0)

        if closed + open_cnt != grand_total:
            warnings.append(
                f"Drainage Row {r_idx} ({zone} - {problem}): Math mismatch! Closed ({closed}) + Open ({open_cnt}) = {closed + open_cnt}, but Grand Total is {grand_total}."
            )

        key = (zone.upper(), problem.upper())
        if key in seen:
            warnings.append(
                f"Drainage Row {r_idx}: Duplicate entry found for Zone '{zone}' and Problem '{problem}'. Auto-merging counts."
            )
            existing = seen[key]
            existing["closed"] += closed
            existing["open"] += open_cnt
            existing["grand_total"] += grand_total
        else:
            new_row = dict(row)
            seen[key] = new_row
            validated_rows.append(new_row)

    return {
        "valid": len(warnings) == 0,
        "warnings": warnings,
        "rows": validated_rows
    }


def validate_water_data(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    warnings = []
    validated_rows = []
    seen = {}

    for row in rows:
        r_idx = row.get("row_index", 0)
        zone = row.get("zone", "")
        total_open = row.get("Total Open", 0)

        # sum of categories
        cat_sum = sum(v for k, v in row.items() if k not in ["row_index", "zone", "Total Open", "Total Closed", "Grand Total"])
        if total_open != cat_sum:
            warnings.append(
                f"Water Row {r_idx} ({zone}): Category sum ({cat_sum}) does not match Total Open ({total_open}). Using calculated sum."
            )
            row["Total Open"] = cat_sum

        key = zone.upper()
        if key in seen:
            warnings.append(f"Water Row {r_idx}: Duplicate zone '{zone}' found. Auto-merging category counts.")
            existing = seen[key]
            for k, v in row.items():
                if k not in ["row_index", "zone"]:
                    existing[k] = existing.get(k, 0) + v
        else:
            new_row = dict(row)
            seen[key] = new_row
            validated_rows.append(new_row)

    return {
        "valid": len(warnings) == 0,
        "warnings": warnings,
        "rows": validated_rows
    }
