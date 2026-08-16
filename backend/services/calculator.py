from typing import List, Dict, Any

def compute_road_stats(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    zones_data = {}
    total_closed = 0
    total_open = 0
    grand_total = 0

    all_categories = sorted(list(set(r["problem"] for r in rows if r.get("problem"))))

    for r in rows:
        z = r["zone"]
        p = r["problem"]
        c = r["closed"]
        o = r["open"]
        gt = r["grand_total"]

        total_closed += c
        total_open += o
        grand_total += gt

        if z not in zones_data:
            zones_data[z] = {
                "zone": z,
                "categories": {},
                "subtotal_closed": 0,
                "subtotal_open": 0,
                "subtotal_grand_total": 0
            }
        
        zones_data[z]["categories"][p] = {
            "closed": c,
            "open": o,
            "grand_total": gt
        }
        zones_data[z]["subtotal_closed"] += c
        zones_data[z]["subtotal_open"] += o
        zones_data[z]["subtotal_grand_total"] += gt

    # Format list of zones
    formatted_zones = []
    for z, data in zones_data.items():
        z_open = data["subtotal_open"]
        z_gt = data["subtotal_grand_total"]
        pct_open = round((z_open / z_gt * 100), 2) if z_gt > 0 else 0.0
        resolution_rate = round((data["subtotal_closed"] / z_gt * 100), 2) if z_gt > 0 else 0.0

        formatted_zones.append({
            "zone": z,
            "categories": data["categories"],
            "subtotal_closed": data["subtotal_closed"],
            "subtotal_open": data["subtotal_open"],
            "subtotal_grand_total": data["subtotal_grand_total"],
            "pct_open": pct_open,
            "resolution_rate": resolution_rate
        })

    pct_open_total = round((total_open / grand_total * 100), 2) if grand_total > 0 else 0.0
    resolution_rate_total = round((total_closed / grand_total * 100), 2) if grand_total > 0 else 0.0

    return {
        "categories": all_categories,
        "zones": formatted_zones,
        "total_closed": total_closed,
        "total_open": total_open,
        "grand_total": grand_total,
        "pct_open": pct_open_total,
        "resolution_rate": resolution_rate_total
    }


def compute_drainage_stats(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    categories = sorted(list(set(r["problem"] for r in rows if r.get("problem"))))
    
    zone_stats = {}
    cat_totals = {c: 0 for c in categories}
    
    total_closed = 0
    total_open = 0
    grand_total = 0

    for r in rows:
        z = r["zone"]
        p = r["problem"]
        c = r["closed"]
        o = r["open"]
        gt = r["grand_total"]

        total_closed += c
        total_open += o
        grand_total += gt
        
        if p in cat_totals:
            cat_totals[p] += o

        if z not in zone_stats:
            zone_stats[z] = {
                "zone": z,
                "cat_open": {cat: 0 for cat in categories},
                "total_open": 0,
                "total_closed": 0,
                "grand_total": 0
            }

        zone_stats[z]["cat_open"][p] = zone_stats[z]["cat_open"].get(p, 0) + o
        zone_stats[z]["total_open"] += o
        zone_stats[z]["total_closed"] += c
        zone_stats[z]["grand_total"] += gt

    table_rows = []
    for z, data in zone_stats.items():
        z_gt = data["grand_total"]
        pct_open = round((data["total_open"] / z_gt * 100), 2) if z_gt > 0 else 0.0
        table_rows.append({
            "zone": z,
            "cat_open": data["cat_open"],
            "total_open": data["total_open"],
            "total_closed": data["total_closed"],
            "grand_total": data["grand_total"],
            "pct_open": pct_open
        })

    # Sort descending by total_open
    table_rows.sort(key=lambda x: x["total_open"], reverse=True)

    # Key Insights Generation
    insights = []
    
    # 1. Primary cause of backlog
    top_cat = max(cat_totals.items(), key=lambda x: x[1]) if cat_totals else ("N/A", 0)
    top_cat_pct = round((top_cat[1] / total_open * 100), 2) if total_open > 0 else 0.0
    insights.append(
        f"Primary cause of backlog: '{top_cat[0]}' with {top_cat[1]} open complaints ({top_cat_pct}% of total citywide open backlog)."
    )

    # 2. Zone backlog severity (top 3)
    top_3_zones = table_rows[:3]
    top_3_names = ", ".join([f"{r['zone']} ({r['total_open']})" for r in top_3_zones])
    insights.append(f"Zone backlog severity ranking: Top 3 affected zones are {top_3_names}.")

    # 3. Highest pending ratio zone
    highest_ratio_zone = max(table_rows, key=lambda x: x["pct_open"]) if table_rows else None
    if highest_ratio_zone:
        insights.append(
            f"Highest pending ratio: Zone '{highest_ratio_zone['zone']}' has the highest pending ratio at {highest_ratio_zone['pct_open']}% open."
        )

    # 4. Safety critical: Manhole Cover Missing
    manhole_cat = None
    for c in categories:
        if "manhole" in c.lower():
            manhole_cat = c
            break

    if manhole_cat:
        manhole_total = cat_totals.get(manhole_cat, 0)
        manhole_zones = []
        for r in table_rows:
            cnt = r["cat_open"].get(manhole_cat, 0)
            if cnt > 0:
                manhole_zones.append((r["zone"], cnt))
        manhole_zones.sort(key=lambda x: x[1], reverse=True)
        top_manhole_str = ", ".join([f"{z} ({c})" for z, c in manhole_zones[:3]]) if manhole_zones else "None"
        insights.append(
            f"Safety Critical Action: '{manhole_cat}' has {manhole_total} pending cases. Top priority zones requiring immediate replacement: {top_manhole_str}."
        )

    resolution_rate = round((total_closed / grand_total * 100), 2) if grand_total > 0 else 0.0
    pct_open_total = round((total_open / grand_total * 100), 2) if grand_total > 0 else 0.0

    highest_open_zone = table_rows[0] if table_rows else {"zone": "N/A", "total_open": 0}

    return {
        "categories": categories,
        "table_rows": table_rows,
        "cat_totals": cat_totals,
        "total_closed": total_closed,
        "total_open": total_open,
        "grand_total": grand_total,
        "resolution_rate": resolution_rate,
        "pct_open": pct_open_total,
        "highest_open_zone": highest_open_zone,
        "insights": insights
    }


def compute_water_stats(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not rows:
        return {}

    # Extract dynamic category columns from row keys
    sample = rows[0]
    cat_columns = [k for k in sample.keys() if k not in ["row_index", "zone", "Total Open", "Total Closed", "Grand Total"]]

    col_totals = {cat: 0 for cat in cat_columns}
    total_open = 0
    zone_rows = []

    for r in rows:
        z = r["zone"]
        tot = r.get("Total Open", 0)
        total_open += tot

        zone_cats = {}
        for cat in cat_columns:
            val = r.get(cat, 0)
            zone_cats[cat] = val
            col_totals[cat] += val

        zone_rows.append({
            "zone": z,
            "categories": zone_cats,
            "total_open": tot
        })

    # Sort zones by Total Open descending
    zone_rows.sort(key=lambda x: x["total_open"], reverse=True)

    top_zone = zone_rows[0] if zone_rows else {"zone": "N/A", "total_open": 0}
    top_cat_name, top_cat_val = max(col_totals.items(), key=lambda x: x[1]) if col_totals else ("N/A", 0)
    top_cat_pct = round((top_cat_val / total_open * 100), 2) if total_open > 0 else 0.0

    # Auto Insights
    insights = []
    insights.append(
        f"Highest Pendency Category: '{top_cat_name}' accounts for {top_cat_val} open complaints ({top_cat_pct}% of total citywide water backlog)."
    )

    top_3_zones = zone_rows[:3]
    top_3_combined_open = sum(z["total_open"] for z in top_3_zones)
    top_3_pct = round((top_3_combined_open / total_open * 100), 2) if total_open > 0 else 0.0
    top_3_names = ", ".join([f"{z['zone']} ({z['total_open']})" for z in top_3_zones])
    insights.append(
        f"Top 3 High-Pressure Zones: {top_3_names} represent {top_3_pct}% of total citywide water complaints."
    )

    per_zone_challenges = []
    for z in zone_rows:
        z_name = z["zone"]
        cats = z["categories"]
        if cats:
            peak_c, peak_val = max(cats.items(), key=lambda x: x[1])
            per_zone_challenges.append(f"{z_name}: {peak_c} ({peak_val})")
    insights.append("Zone-Specific Key Challenges: " + "; ".join(per_zone_challenges) + ".")

    return {
        "categories": cat_columns,
        "col_totals": col_totals,
        "zone_rows": zone_rows,
        "total_open": total_open,
        "top_zone": top_zone,
        "top_category": {"name": top_cat_name, "count": top_cat_val, "pct": top_cat_pct},
        "insights": insights
    }
