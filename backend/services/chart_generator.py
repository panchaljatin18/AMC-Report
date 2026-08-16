import os
import matplotlib
matplotlib.use("Agg")  # Non-gui backend
import matplotlib.pyplot as plt
import numpy as np
from typing import Dict, Any

# Custom palette
COLORS = ["#1E3A8A", "#EF4444", "#F59E0B", "#10B981", "#6366F1", "#8B5CF6", "#EC4899", "#14B8A6"]

def generate_road_chart(road_stats: Dict[str, Any], output_path: str) -> str:
    """
    Road Grouped Bar Chart:
    X: Zones | Y: Open Complaints Count
    3 bars per zone (Blue / Red / Orange), data labels on top
    """
    zones = [z["zone"] for z in road_stats["zones"]]
    categories = road_stats["categories"]

    x = np.arange(len(zones))
    width = 0.25 if len(categories) <= 3 else 0.8 / len(categories)

    fig, ax = plt.subplots(figsize=(10, 5), dpi=200)

    for i, cat in enumerate(categories):
        values = []
        for z in road_stats["zones"]:
            values.append(z["categories"].get(cat, {}).get("open", 0))
        
        rects = ax.bar(x + (i - len(categories)/2 + 0.5) * width, values, width, label=cat, color=COLORS[i % len(COLORS)])
        
        # Add labels
        for rect in rects:
            height = rect.get_height()
            if height > 0:
                ax.annotate(f'{int(height)}',
                            xy=(rect.get_x() + rect.get_width() / 2, height),
                            xytext=(0, 3),  # 3 points vertical offset
                            textcoords="offset points",
                            ha='center', va='bottom', fontsize=8, fontweight='bold')

    ax.set_ylabel('Open Complaints Count', fontsize=11, fontweight='bold', color='#1E293B')
    ax.set_title('Open Complaints Breakdown by Problem Category across Zones', fontsize=13, fontweight='bold', color='#0F172A', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(zones, fontsize=9, fontweight='bold', color='#334155')
    ax.legend(frameon=True, facecolor='#F8FAFC', edgecolor='#CBD5E1', fontsize=9)
    ax.grid(axis='y', linestyle='--', alpha=0.5)

    plt.tight_layout()
    plt.savefig(output_path, bbox_inches='tight')
    plt.close()
    return output_path


def generate_drainage_charts(drainage_stats: Dict[str, Any], output_dir: str) -> Dict[str, str]:
    """
    Chart 1: Grouped bar - Open Complaints Category Breakdown by Zone
    Chart 2: Single bar - Total Open Complaints Volume by Zone
    """
    table_rows = drainage_stats["table_rows"]
    zones = [r["zone"] for r in table_rows]
    categories = drainage_stats["categories"]

    # Chart 1: Grouped Bar
    x = np.arange(len(zones))
    width = 0.8 / max(len(categories), 1)

    fig, ax = plt.subplots(figsize=(10, 5), dpi=200)

    for i, cat in enumerate(categories):
        values = [r["cat_open"].get(cat, 0) for r in table_rows]
        rects = ax.bar(x + (i - len(categories)/2 + 0.5) * width, values, width, label=cat, color=COLORS[i % len(COLORS)])
        for rect in rects:
            height = rect.get_height()
            if height > 0:
                ax.annotate(f'{int(height)}',
                            xy=(rect.get_x() + rect.get_width() / 2, height),
                            xytext=(0, 3),
                            textcoords="offset points",
                            ha='center', va='bottom', fontsize=7, fontweight='bold')

    ax.set_ylabel('Open Complaints Count', fontsize=11, fontweight='bold', color='#1E293B')
    ax.set_title('Open Complaints Category Breakdown by Zone', fontsize=13, fontweight='bold', color='#0F172A', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(zones, fontsize=9, fontweight='bold', color='#334155', rotation=15)
    ax.legend(frameon=True, facecolor='#F8FAFC', edgecolor='#CBD5E1', fontsize=8)
    ax.grid(axis='y', linestyle='--', alpha=0.5)

    plt.tight_layout()
    chart1_path = os.path.join(output_dir, "drainage_cat_breakdown.png")
    plt.savefig(chart1_path, bbox_inches='tight')
    plt.close()

    # Chart 2: Single Bar
    fig2, ax2 = plt.subplots(figsize=(10, 4.5), dpi=200)
    totals = [r["total_open"] for r in table_rows]
    rects2 = ax2.bar(zones, totals, color='#1E3A8A', width=0.55)

    for rect in rects2:
        height = rect.get_height()
        if height > 0:
            ax2.annotate(f'{int(height)}',
                         xy=(rect.get_x() + rect.get_width() / 2, height),
                         xytext=(0, 3),
                         textcoords="offset points",
                         ha='center', va='bottom', fontsize=9, fontweight='bold', color='#1E3A8A')

    ax2.set_ylabel('Total Open Complaints', fontsize=11, fontweight='bold', color='#1E293B')
    ax2.set_title('Total Open Complaints Volume by Zone', fontsize=13, fontweight='bold', color='#0F172A', pad=15)
    ax2.set_xticks(range(len(zones)))
    ax2.set_xticklabels(zones, fontsize=9, fontweight='bold', color='#334155', rotation=15)
    ax2.grid(axis='y', linestyle='--', alpha=0.5)

    plt.tight_layout()
    chart2_path = os.path.join(output_dir, "drainage_total_volume.png")
    plt.savefig(chart2_path, bbox_inches='tight')
    plt.close()

    return {"cat_breakdown": chart1_path, "total_volume": chart2_path}


def generate_water_chart(water_stats: Dict[str, Any], output_path: str) -> str:
    """
    Water Grouped Bar Chart:
    X: Zone | bars: each category
    """
    zone_rows = water_stats["zone_rows"]
    zones = [z["zone"] for z in zone_rows]
    categories = water_stats["categories"]

    x = np.arange(len(zones))
    width = 0.8 / max(len(categories), 1)

    fig, ax = plt.subplots(figsize=(10, 5), dpi=200)

    for i, cat in enumerate(categories):
        values = [z["categories"].get(cat, 0) for z in zone_rows]
        rects = ax.bar(x + (i - len(categories)/2 + 0.5) * width, values, width, label=cat, color=COLORS[i % len(COLORS)])
        for rect in rects:
            height = rect.get_height()
            if height > 0:
                ax.annotate(f'{int(height)}',
                            xy=(rect.get_x() + rect.get_width() / 2, height),
                            xytext=(0, 3),
                            textcoords="offset points",
                            ha='center', va='bottom', fontsize=7, fontweight='bold')

    ax.set_ylabel('Open Complaints Count', fontsize=11, fontweight='bold', color='#1E293B')
    ax.set_title('Open Complaints Count by Zone & Category', fontsize=13, fontweight='bold', color='#0F172A', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(zones, fontsize=9, fontweight='bold', color='#334155', rotation=15)
    ax.legend(frameon=True, facecolor='#F8FAFC', edgecolor='#CBD5E1', fontsize=8)
    ax.grid(axis='y', linestyle='--', alpha=0.5)

    plt.tight_layout()
    plt.savefig(output_path, bbox_inches='tight')
    plt.close()
    return output_path
