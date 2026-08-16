import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from typing import Dict, Any

NAVY_BLUE = RGBColor(30, 58, 138)
DARK_NAVY = RGBColor(15, 23, 42)
LIGHT_BG = RGBColor(248, 250, 252)
RED_COLOR = RGBColor(220, 38, 38)
GREEN_COLOR = RGBColor(22, 163, 74)
ORANGE_COLOR = RGBColor(217, 119, 6)
BLUE_COLOR = RGBColor(37, 99, 235)
GRAY_BG = RGBColor(241, 245, 249)
PINK_HIGHLIGHT = RGBColor(254, 226, 226)
WHITE = RGBColor(255, 255, 255)

def _add_header(slide, title_text: str, subtitle_text: str):
    banner = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.1))
    banner.fill.solid()
    banner.fill.fore_color.rgb = DARK_NAVY
    banner.line.color.rgb = DARK_NAVY

    tf = banner.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.5)
    tf.margin_top = Inches(0.15)

    p1 = tf.paragraphs[0]
    p1.text = title_text
    p1.font.name = 'Calibri'
    p1.font.size = Pt(22)
    p1.font.bold = True
    p1.font.color.rgb = WHITE

    p2 = tf.add_paragraph()
    p2.text = subtitle_text
    p2.font.name = 'Calibri'
    p2.font.size = Pt(12)
    p2.font.color.rgb = RGBColor(148, 163, 184)


def _add_kpi_card(slide, left, top, width, height, title, value, subtext="", accent_color=BLUE_COLOR):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = LIGHT_BG
    card.line.color.rgb = RGBColor(226, 232, 240)

    # Accent top border line
    accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Inches(0.1))
    accent.fill.solid()
    accent.fill.fore_color.rgb = accent_color
    accent.line.color.rgb = accent_color

    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.2)
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)

    p0 = tf.paragraphs[0]
    p0.text = title.upper()
    p0.font.size = Pt(10)
    p0.font.bold = True
    p0.font.color.rgb = RGBColor(100, 116, 139)

    p1 = tf.add_paragraph()
    p1.text = str(value)
    p1.font.size = Pt(24)
    p1.font.bold = True
    p1.font.color.rgb = DARK_NAVY

    if subtext:
        p2 = tf.add_paragraph()
        p2.text = subtext
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = accent_color


def build_ppt_presentation(
    road_stats: Dict[str, Any],
    drainage_stats: Dict[str, Any],
    water_stats: Dict[str, Any],
    chart_paths: Dict[str, Any],
    date_range: str,
    output_ppt_path: str
):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # -------------------------------------------------------------
    # SLIDE 1 & 2: ROAD REPORT
    # -------------------------------------------------------------
    # Slide 1: Road Chart & Stats
    slide1 = prs.slides.add_slide(blank_layout)
    _add_header(slide1, "Zone wise Road CCRS Complaints Report", f"Open Complaints Breakdown • Reporting Period: {date_range}")

    if "road_chart" in chart_paths and os.path.exists(chart_paths["road_chart"]):
        slide1.shapes.add_picture(chart_paths["road_chart"], Inches(0.5), Inches(1.3), Inches(7.5), Inches(5.8))

    # Summary box on side
    _add_kpi_card(slide1, Inches(8.3), Inches(1.5), Inches(4.5), Inches(1.4), "TOTAL ROAD COMPLAINTS", road_stats["grand_total"], f"{road_stats['pct_open']}% Open", RED_COLOR)
    _add_kpi_card(slide1, Inches(8.3), Inches(3.1), Inches(4.5), Inches(1.4), "CLOSED ROAD COMPLAINTS", road_stats["total_closed"], f"{road_stats['resolution_rate']}% Resolution Rate", GREEN_COLOR)
    _add_kpi_card(slide1, Inches(8.3), Inches(4.7), Inches(4.5), Inches(1.4), "OPEN ROAD COMPLAINTS", road_stats["total_open"], "Requires Field Maintenance", ORANGE_COLOR)

    # Slide 2: Road Detailed Table
    slide2 = prs.slides.add_slide(blank_layout)
    _add_header(slide2, "Zone wise Road CCRS Complaints - Data Table", f"Detailed Zone & Problem Breakdown • {date_range}")

    # Build Table
    zones = road_stats["zones"]
    num_rows = sum(len(z["categories"]) + 1 for z in zones) + 2  # header + grand total
    table_shape = slide2.shapes.add_table(num_rows, 5, Inches(0.5), Inches(1.3), Inches(12.333), Inches(5.8))
    table = table_shape.table
    table.columns[0].width = Inches(2.5)
    table.columns[1].width = Inches(3.8)
    table.columns[2].width = Inches(2.0)
    table.columns[3].width = Inches(2.0)
    table.columns[4].width = Inches(2.033)

    headers = ["ZONE", "PROBLEM CATEGORY", "CLOSED", "OPEN", "GRAND TOTAL"]
    for col_idx, h in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY_BLUE
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

    current_r = 1
    for z_data in zones:
        z_name = z_data["zone"]
        for cat_name, cat_vals in z_data["categories"].items():
            cell_z = table.cell(current_r, 0)
            cell_z.text = z_name
            cell_p = table.cell(current_r, 1)
            cell_p.text = cat_name

            cell_c = table.cell(current_r, 2)
            cell_c.text = str(cat_vals["closed"])
            cell_c.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

            cell_o = table.cell(current_r, 3)
            cell_o.text = str(cat_vals["open"])
            p_o = cell_o.text_frame.paragraphs[0]
            p_o.alignment = PP_ALIGN.CENTER
            p_o.font.bold = True
            p_o.font.color.rgb = RED_COLOR

            cell_gt = table.cell(current_r, 4)
            cell_gt.text = str(cat_vals["grand_total"])
            cell_gt.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
            current_r += 1

        # Subtotal row
        cell_z = table.cell(current_r, 0)
        cell_z.text = f"{z_name} Subtotal"
        cell_z.text_frame.paragraphs[0].font.bold = True

        for c_idx in range(5):
            cell = table.cell(current_r, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = GRAY_BG

        cell_c = table.cell(current_r, 2)
        cell_c.text = str(z_data["subtotal_closed"])
        cell_c.text_frame.paragraphs[0].font.bold = True
        cell_c.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        cell_o = table.cell(current_r, 3)
        cell_o.text = str(z_data["subtotal_open"])
        p_o = cell_o.text_frame.paragraphs[0]
        p_o.font.bold = True
        p_o.font.color.rgb = RED_COLOR
        p_o.alignment = PP_ALIGN.CENTER

        cell_gt = table.cell(current_r, 4)
        cell_gt.text = str(z_data["subtotal_grand_total"])
        cell_gt.text_frame.paragraphs[0].font.bold = True
        cell_gt.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        current_r += 1

    # Grand Total row
    for c_idx in range(5):
        cell = table.cell(current_r, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = DARK_NAVY

    cell_gt_lbl = table.cell(current_r, 0)
    cell_gt_lbl.text = "GRAND TOTAL"
    p = cell_gt_lbl.text_frame.paragraphs[0]
    p.font.bold = True
    p.font.color.rgb = WHITE

    cell_c = table.cell(current_r, 2)
    cell_c.text = str(road_stats["total_closed"])
    p = cell_c.text_frame.paragraphs[0]
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.CENTER

    cell_o = table.cell(current_r, 3)
    cell_o.text = str(road_stats["total_open"])
    p = cell_o.text_frame.paragraphs[0]
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.CENTER

    cell_gt = table.cell(current_r, 4)
    cell_gt.text = str(road_stats["grand_total"])
    p = cell_gt.text_frame.paragraphs[0]
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.CENTER

    # -------------------------------------------------------------
    # SLIDE 3 & 4: DRAINAGE REPORT
    # -------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    _add_header(slide3, "CCRS Drainage Complaints Summary Report", f"Comprehensive Zone-Wise Analysis • Period: {date_range}")

    # 4 KPI Stat Cards top row
    _add_kpi_card(slide3, Inches(0.5), Inches(1.3), Inches(2.8), Inches(1.2), "TOTAL COMPLAINTS", drainage_stats["grand_total"], accent_color=BLUE_COLOR)
    _add_kpi_card(slide3, Inches(3.6), Inches(1.3), Inches(2.8), Inches(1.2), "CLOSED COMPLAINTS", drainage_stats["total_closed"], f"{drainage_stats['resolution_rate']}% Res. Rate", GREEN_COLOR)
    _add_kpi_card(slide3, Inches(6.7), Inches(1.3), Inches(2.8), Inches(1.2), "OPEN COMPLAINTS", drainage_stats["total_open"], f"{drainage_stats['pct_open']}% Pending Action", RED_COLOR)
    
    top_z = drainage_stats["highest_open_zone"]
    _add_kpi_card(slide3, Inches(9.8), Inches(1.3), Inches(3.0), Inches(1.2), "HIGHEST OPEN ZONE", top_z['zone'], f"{top_z['total_open']} Open Cases", ORANGE_COLOR)

    # Charts on Slide 3
    if "drainage_cat" in chart_paths and os.path.exists(chart_paths["drainage_cat"]):
        slide3.shapes.add_picture(chart_paths["drainage_cat"], Inches(0.5), Inches(2.7), Inches(6.0), Inches(4.4))
    if "drainage_total" in chart_paths and os.path.exists(chart_paths["drainage_total"]):
        slide3.shapes.add_picture(chart_paths["drainage_total"], Inches(6.8), Inches(2.7), Inches(6.0), Inches(4.4))

    # Slide 4: Drainage Data Table & Insights
    slide4 = prs.slides.add_slide(blank_layout)
    _add_header(slide4, "CCRS Drainage Complaints - Detailed Data & Executive Insights", f"Zone Matrix & Actionable Strategy • {date_range}")

    # Data Table
    d_rows = drainage_stats["table_rows"]
    d_cats = drainage_stats["categories"]
    table_shape4 = slide4.shapes.add_table(len(d_rows) + 2, len(d_cats) + 5, Inches(0.5), Inches(1.3), Inches(12.333), Inches(3.6))
    t4 = table_shape4.table

    d_headers = ["Zone"] + d_cats + ["Total Open", "Total Closed", "Grand Total", "% Open"]
    for c_idx, h in enumerate(d_headers):
        cell = t4.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY_BLUE
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.bold = True
        p.font.size = Pt(9)
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

    for r_idx, r_data in enumerate(d_rows):
        row_pos = r_idx + 1
        t4.cell(row_pos, 0).text = r_data["zone"]
        for c_idx, cat in enumerate(d_cats):
            val = r_data["cat_open"].get(cat, 0)
            cell = t4.cell(row_pos, c_idx + 1)
            cell.text = str(val)
            cell.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        c_offset = len(d_cats) + 1
        t4.cell(row_pos, c_offset).text = str(r_data["total_open"])
        t4.cell(row_pos, c_offset + 1).text = str(r_data["total_closed"])
        t4.cell(row_pos, c_offset + 2).text = str(r_data["grand_total"])
        t4.cell(row_pos, c_offset + 3).text = f"{r_data['pct_open']}%"

    # All zones combined row
    last_r = len(d_rows) + 1
    for c_idx in range(len(d_headers)):
        cell = t4.cell(last_r, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = DARK_NAVY

    t4.cell(last_r, 0).text = "ALL ZONES COMBINED"
    t4.cell(last_r, 0).text_frame.paragraphs[0].font.bold = True
    t4.cell(last_r, 0).text_frame.paragraphs[0].font.color.rgb = WHITE

    for c_idx, cat in enumerate(d_cats):
        tot = drainage_stats["cat_totals"].get(cat, 0)
        cell = t4.cell(last_r, c_idx + 1)
        cell.text = str(tot)
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

    c_offset = len(d_cats) + 1
    t4.cell(last_r, c_offset).text = str(drainage_stats["total_open"])
    t4.cell(last_r, c_offset + 1).text = str(drainage_stats["total_closed"])
    t4.cell(last_r, c_offset + 2).text = str(drainage_stats["grand_total"])
    t4.cell(last_r, c_offset + 3).text = f"{drainage_stats['pct_open']}%"

    # Insights section on slide 4 bottom
    insights_box = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(5.1), Inches(12.333), Inches(2.0))
    insights_box.fill.solid()
    insights_box.fill.fore_color.rgb = LIGHT_BG
    insights_box.line.color.rgb = RGBColor(203, 213, 225)

    tf_ins = insights_box.text_frame
    tf_ins.word_wrap = True
    tf_ins.margin_left = Inches(0.3)
    tf_ins.margin_top = Inches(0.15)

    p_title = tf_ins.paragraphs[0]
    p_title.text = "KEY INSIGHTS & EXECUTIVE SUMMARY"
    p_title.font.bold = True
    p_title.font.size = Pt(12)
    p_title.font.color.rgb = NAVY_BLUE

    for ins in drainage_stats.get("insights", []):
        p = tf_ins.add_paragraph()
        p.text = f"• {ins}"
        p.font.size = Pt(10)
        p.font.color.rgb = DARK_NAVY

    # -------------------------------------------------------------
    # SLIDE 5 & 6: WATER REPORT
    # -------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    _add_header(slide5, "CCRS Water Complaints: Zone & Category Open Summary", f"Reporting Period: {date_range}")

    # 4 KPI Stat Cards
    _add_kpi_card(slide5, Inches(0.5), Inches(1.3), Inches(2.8), Inches(1.2), "TOTAL OPEN COMPLAINTS", water_stats["total_open"], "Citywide Water Backlog", RED_COLOR)
    _add_kpi_card(slide5, Inches(3.6), Inches(1.3), Inches(2.8), Inches(1.2), "TOP OPEN ZONE", water_stats["top_zone"]["zone"], f"{water_stats['top_zone']['total_open']} Open Cases", ORANGE_COLOR)
    _add_kpi_card(slide5, Inches(6.7), Inches(1.3), Inches(2.8), Inches(1.2), "TOP OPEN CATEGORY", water_stats["top_category"]["name"], f"{water_stats['top_category']['count']} ({water_stats['top_category']['pct']}%)", BLUE_COLOR)
    _add_kpi_card(slide5, Inches(9.8), Inches(1.3), Inches(3.0), Inches(1.2), "CATEGORIES TRACKED", len(water_stats["categories"]), "Active Water Issues", GREEN_COLOR)

    # Water Chart on Slide 5
    if "water_chart" in chart_paths and os.path.exists(chart_paths["water_chart"]):
        slide5.shapes.add_picture(chart_paths["water_chart"], Inches(0.5), Inches(2.7), Inches(12.333), Inches(4.5))

    # Slide 6: Water Matrix Table & Strategic Focus
    slide6 = prs.slides.add_slide(blank_layout)
    _add_header(slide6, "CCRS Water Complaints - Zone x Category Matrix & Strategic Focus", f"Detailed Open Counts • {date_range}")

    w_cats = water_stats["categories"]
    w_zrows = water_stats["zone_rows"]
    col_totals = water_stats["col_totals"]

    table_shape6 = slide6.shapes.add_table(len(w_zrows) + 2, len(w_cats) + 2, Inches(0.5), Inches(1.3), Inches(12.333), Inches(3.6))
    t6 = table_shape6.table

    w_headers = ["Zone Name"] + w_cats + ["Total Open"]
    for c_idx, h in enumerate(w_headers):
        cell = t6.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY_BLUE
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.bold = True
        p.font.size = Pt(9)
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

    # Find peak value per category column to apply light-pink highlight
    col_peaks = {}
    for cat in w_cats:
        peak_val = max(z["categories"].get(cat, 0) for z in w_zrows) if w_zrows else 0
        col_peaks[cat] = peak_val

    for r_idx, z_data in enumerate(w_zrows):
        row_pos = r_idx + 1
        t6.cell(row_pos, 0).text = z_data["zone"]
        for c_idx, cat in enumerate(w_cats):
            val = z_data["categories"].get(cat, 0)
            cell = t6.cell(row_pos, c_idx + 1)
            cell.text = str(val)
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.CENTER
            
            # Apply pink highlight if peak
            if val > 0 and val == col_peaks.get(cat, -1):
                cell.fill.solid()
                cell.fill.fore_color.rgb = PINK_HIGHLIGHT
                p.font.bold = True
                p.font.color.rgb = RED_COLOR

        t6.cell(row_pos, len(w_cats) + 1).text = str(z_data["total_open"])
        t6.cell(row_pos, len(w_cats) + 1).text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Total Open Row
    last_r6 = len(w_zrows) + 1
    for c_idx in range(len(w_headers)):
        cell = t6.cell(last_r6, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = DARK_NAVY

    t6.cell(last_r6, 0).text = "Total Open"
    t6.cell(last_r6, 0).text_frame.paragraphs[0].font.bold = True
    t6.cell(last_r6, 0).text_frame.paragraphs[0].font.color.rgb = WHITE

    for c_idx, cat in enumerate(w_cats):
        tot = col_totals.get(cat, 0)
        cell = t6.cell(last_r6, c_idx + 1)
        cell.text = str(tot)
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

    t6.cell(last_r6, len(w_cats) + 1).text = str(water_stats["total_open"])
    t6.cell(last_r6, len(w_cats) + 1).text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    t6.cell(last_r6, len(w_cats) + 1).text_frame.paragraphs[0].font.bold = True
    t6.cell(last_r6, len(w_cats) + 1).text_frame.paragraphs[0].font.color.rgb = WHITE

    # Strategic Focus Areas
    ins_box6 = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(5.1), Inches(12.333), Inches(2.0))
    ins_box6.fill.solid()
    ins_box6.fill.fore_color.rgb = LIGHT_BG
    ins_box6.line.color.rgb = RGBColor(203, 213, 225)

    tf_ins6 = ins_box6.text_frame
    tf_ins6.word_wrap = True
    tf_ins6.margin_left = Inches(0.3)
    tf_ins6.margin_top = Inches(0.15)

    p_title6 = tf_ins6.paragraphs[0]
    p_title6.text = "KEY INSIGHTS & STRATEGIC FOCUS AREAS"
    p_title6.font.bold = True
    p_title6.font.size = Pt(12)
    p_title6.font.color.rgb = NAVY_BLUE

    for ins in water_stats.get("insights", []):
        p = tf_ins6.add_paragraph()
        p.text = f"• {ins}"
        p.font.size = Pt(10)
        p.font.color.rgb = DARK_NAVY

    prs.save(output_ppt_path)
    return output_ppt_path
