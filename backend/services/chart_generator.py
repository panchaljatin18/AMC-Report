import os
import matplotlib
matplotlib.use("Agg")  # Non-gui backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.patheffects as pe
import numpy as np
from typing import Dict, Any

# ── Professional AMC color palette ────────────────────────────────────────────
PALETTE = [
    "#1E3A8A",  # Deep Navy
    "#EF4444",  # Vivid Red
    "#F59E0B",  # Amber
    "#10B981",  # Emerald
    "#6366F1",  # Indigo
    "#8B5CF6",  # Violet
    "#EC4899",  # Pink
    "#14B8A6",  # Teal
    "#F97316",  # Orange
    "#0EA5E9",  # Sky Blue
]

NAVY        = "#1E3A8A"
RED         = "#EF4444"
AMBER       = "#F59E0B"
BG_COLOR    = "#F8FAFC"
GRID_COLOR  = "#E2E8F0"
LABEL_COLOR = "#0F172A"


def _apply_style(ax, fig):
    """Apply clean, professional styling to any axis."""
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    # Hide all spines except bottom
    for spine in ["top", "right", "left"]:
        ax.spines[spine].set_visible(False)
    ax.spines["bottom"].set_color("#CBD5E1")
    ax.tick_params(colors="#475569", length=0)
    ax.yaxis.grid(True, linestyle="--", linewidth=0.6, color=GRID_COLOR, zorder=0)
    ax.set_axisbelow(True)


def _bar_label(ax, rects, fontsize=9):
    """Draw bold data labels on bars with white outline for legibility."""
    for rect in rects:
        height = rect.get_height()
        if height > 0:
            txt = ax.annotate(
                f"{int(height)}",
                xy=(rect.get_x() + rect.get_width() / 2, height),
                xytext=(0, 4),
                textcoords="offset points",
                ha="center", va="bottom",
                fontsize=fontsize, fontweight="bold", color=LABEL_COLOR,
            )
            txt.set_path_effects([
                pe.withStroke(linewidth=2.5, foreground="white")
            ])


# ──────────────────────────────────────────────────────────────────────────────
# ROAD CHART
# ──────────────────────────────────────────────────────────────────────────────
def generate_road_chart(road_stats: Dict[str, Any], output_path: str) -> str:
    """
    Grouped bar chart per zone — Closed (navy) | Open (red) | Grand Total (amber).
    Ultra-HD 300 DPI.
    """
    zones      = [z["zone"] for z in road_stats["zones"]]
    categories = road_stats["categories"]

    # Build value arrays
    closed_vals = [z["subtotal_closed"] for z in road_stats["zones"]]
    open_vals   = [z["subtotal_open"]   for z in road_stats["zones"]]
    gt_vals     = [z["subtotal_grand_total"] for z in road_stats["zones"]]

    x     = np.arange(len(zones))
    width = 0.24
    n_z   = len(zones)

    fig, ax = plt.subplots(figsize=(max(10, n_z * 1.4), 5.5), dpi=300)
    _apply_style(ax, fig)

    r1 = ax.bar(x - width,     closed_vals, width, label="Closed",      color=NAVY,  zorder=3, edgecolor="white", linewidth=0.5)
    r2 = ax.bar(x,             open_vals,   width, label="Open",        color=RED,   zorder=3, edgecolor="white", linewidth=0.5)
    r3 = ax.bar(x + width,     gt_vals,     width, label="Grand Total", color=AMBER, zorder=3, edgecolor="white", linewidth=0.5)

    _bar_label(ax, r1, fontsize=8)
    _bar_label(ax, r2, fontsize=8)
    _bar_label(ax, r3, fontsize=8)

    ax.set_xticks(x)
    ax.set_xticklabels(zones, fontsize=9, fontweight="bold", color="#334155")
    ax.set_ylabel("Complaints Count", fontsize=10, fontweight="bold", color="#334155")
    ax.set_title(
        "Open Complaints Breakdown by Problem Category across Zones",
        fontsize=13, fontweight="bold", color=LABEL_COLOR, pad=14
    )
    ax.legend(
        frameon=True, facecolor="white", edgecolor="#CBD5E1",
        fontsize=9, loc="upper right", framealpha=0.95
    )

    plt.tight_layout(pad=1.5)
    plt.savefig(output_path, bbox_inches="tight", dpi=300)
    plt.close()
    return output_path


# ──────────────────────────────────────────────────────────────────────────────
# DRAINAGE CHARTS
# ──────────────────────────────────────────────────────────────────────────────
def generate_drainage_charts(drainage_stats: Dict[str, Any], output_dir: str) -> Dict[str, str]:
    """
    Chart 1 (drainage_cat): Grouped bar — Open Complaints Category Breakdown by Zone
    Chart 2 (drainage_total): Horizontal bar — Total Open Complaints Volume by Zone
    """
    table_rows = drainage_stats["table_rows"]
    zones      = [r["zone"] for r in table_rows]
    categories = drainage_stats["categories"]

    # ── Chart 1: Grouped Bar (Category × Zone) ────────────────────────────────
    n_cats = max(len(categories), 1)
    x      = np.arange(len(zones))
    width  = min(0.8 / n_cats, 0.18)

    fig1, ax1 = plt.subplots(figsize=(max(10, len(zones) * 1.5), 5.5), dpi=300)
    _apply_style(ax1, fig1)

    for i, cat in enumerate(categories):
        values = [r["cat_open"].get(cat, 0) for r in table_rows]
        offset = (i - n_cats / 2 + 0.5) * width
        rects  = ax1.bar(x + offset, values, width,
                         label=cat, color=PALETTE[i % len(PALETTE)],
                         zorder=3, edgecolor="white", linewidth=0.4)
        _bar_label(ax1, rects, fontsize=7)

    ax1.set_xticks(x)
    ax1.set_xticklabels(zones, fontsize=8, fontweight="bold", color="#334155", rotation=20, ha="right")
    ax1.set_ylabel("Open Complaints Count", fontsize=10, fontweight="bold", color="#334155")
    ax1.set_title("Open Complaints Category Breakdown by Zone",
                  fontsize=13, fontweight="bold", color=LABEL_COLOR, pad=14)
    ax1.legend(frameon=True, facecolor="white", edgecolor="#CBD5E1",
               fontsize=7.5, loc="upper right", framealpha=0.95, ncol=2)

    plt.tight_layout(pad=1.5)
    chart1_path = os.path.join(output_dir, "drainage_cat_breakdown.png")
    plt.savefig(chart1_path, bbox_inches="tight", dpi=300)
    plt.close()

    # ── Chart 2: Horizontal Bar — Total Open by Zone ──────────────────────────
    totals      = [r["total_open"] for r in table_rows]
    sorted_data = sorted(zip(zones, totals), key=lambda t: t[1])
    s_zones, s_totals = zip(*sorted_data) if sorted_data else ([], [])

    fig2, ax2 = plt.subplots(figsize=(9, max(4.5, len(zones) * 0.55)), dpi=300)
    _apply_style(ax2, fig2)

    # Color bars by value rank (darkest = highest)
    bar_colors = [PALETTE[0]] * len(s_zones)
    bar_colors[-1] = RED  # Highest zone highlighted red

    bars = ax2.barh(list(s_zones), list(s_totals), color=bar_colors,
                    height=0.55, zorder=3, edgecolor="white", linewidth=0.5)

    for bar, val in zip(bars, s_totals):
        if val > 0:
            txt = ax2.text(
                bar.get_width() + max(s_totals) * 0.01,
                bar.get_y() + bar.get_height() / 2,
                f"{int(val)}",
                va="center", ha="left",
                fontsize=9, fontweight="bold", color=LABEL_COLOR
            )
            txt.set_path_effects([pe.withStroke(linewidth=2, foreground="white")])

    ax2.set_xlabel("Total Open Complaints", fontsize=10, fontweight="bold", color="#334155")
    ax2.set_title("Total Open Drainage Complaints Volume by Zone",
                  fontsize=13, fontweight="bold", color=LABEL_COLOR, pad=14)
    ax2.xaxis.grid(True, linestyle="--", linewidth=0.6, color=GRID_COLOR, zorder=0)
    ax2.yaxis.grid(False)
    ax2.spines["bottom"].set_visible(False)
    ax2.spines["left"].set_color("#CBD5E1")

    plt.tight_layout(pad=1.5)
    chart2_path = os.path.join(output_dir, "drainage_total_volume.png")
    plt.savefig(chart2_path, bbox_inches="tight", dpi=300)
    plt.close()

    return {"cat_breakdown": chart1_path, "total_volume": chart2_path}


# ──────────────────────────────────────────────────────────────────────────────
# WATER CHART
# ──────────────────────────────────────────────────────────────────────────────
def generate_water_chart(water_stats: Dict[str, Any], output_path: str) -> str:
    """
    Grouped bar chart — Open Complaints by Zone & Category (multi-color bars).
    Ultra-HD 300 DPI.
    """
    zone_rows  = water_stats["zone_rows"]
    zones      = [z["zone"] for z in zone_rows]
    categories = water_stats["categories"]

    n_cats = max(len(categories), 1)
    x      = np.arange(len(zones))
    width  = min(0.8 / n_cats, 0.15)

    fig, ax = plt.subplots(figsize=(max(11, len(zones) * 1.6), 5.5), dpi=300)
    _apply_style(ax, fig)

    for i, cat in enumerate(categories):
        values = [z["categories"].get(cat, 0) for z in zone_rows]
        offset = (i - n_cats / 2 + 0.5) * width
        rects  = ax.bar(x + offset, values, width,
                        label=cat, color=PALETTE[i % len(PALETTE)],
                        zorder=3, edgecolor="white", linewidth=0.4)
        _bar_label(ax, rects, fontsize=7)

    ax.set_xticks(x)
    ax.set_xticklabels(zones, fontsize=8, fontweight="bold", color="#334155", rotation=20, ha="right")
    ax.set_ylabel("Open Complaints Count", fontsize=10, fontweight="bold", color="#334155")
    ax.set_title("Open Complaints Count by Zone & Category",
                 fontsize=13, fontweight="bold", color=LABEL_COLOR, pad=14)
    ax.legend(frameon=True, facecolor="white", edgecolor="#CBD5E1",
              fontsize=7.5, loc="upper right", framealpha=0.95, ncol=2)

    plt.tight_layout(pad=1.5)
    plt.savefig(output_path, bbox_inches="tight", dpi=300)
    plt.close()
    return output_path
