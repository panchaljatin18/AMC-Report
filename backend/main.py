import os
import shutil
import uuid
import datetime
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from backend.config import UPLOAD_DIR, GENERATED_DIR
from backend.database import db_instance
from backend.services.excel_parser import parse_road_excel, parse_drainage_excel, parse_water_excel
from backend.services.validator import validate_road_data, validate_drainage_data, validate_water_data
from backend.services.calculator import compute_road_stats, compute_drainage_stats, compute_water_stats
from backend.services.chart_generator import generate_road_chart, generate_drainage_charts, generate_water_chart
from backend.services.ppt_generator import build_ppt_presentation
from backend.services.sample_generator import generate_sample_excels

app = FastAPI(title="CCRS CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "CCRS CRM API is active", "version": "1.0.0"}


@app.post("/api/reports/generate-sample-files")
def create_samples():
    sample_dir = UPLOAD_DIR / "samples"
    files = generate_sample_excels(sample_dir)
    return {
        "message": "Sample Excel files generated successfully",
        "files": {k: f"/api/reports/sample-files/{v.name}" for k, v in files.items()}
    }


@app.get("/api/reports/sample-files/{filename}")
def download_sample_file(filename: str):
    file_path = UPLOAD_DIR / "samples" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Sample file not found")
    return FileResponse(path=file_path, filename=filename)


@app.post("/api/reports/generate")
async def generate_report(
    road_file: UploadFile = File(...),
    drainage_file: UploadFile = File(...),
    water_file: UploadFile = File(...),
    date_range: str = Form("Current Month")
):
    session_id = str(uuid.uuid4())[:8]
    session_upload_dir = UPLOAD_DIR / session_id
    session_upload_dir.mkdir(parents=True, exist_ok=True)

    road_path = session_upload_dir / road_file.filename
    drainage_path = session_upload_dir / drainage_file.filename
    water_path = session_upload_dir / water_file.filename

    with open(road_path, "wb") as f:
        shutil.copyfileobj(road_file.file, f)
    with open(drainage_path, "wb") as f:
        shutil.copyfileobj(drainage_file.file, f)
    with open(water_path, "wb") as f:
        shutil.copyfileobj(water_file.file, f)

    # 1. Parse Excel Files
    try:
        raw_road = parse_road_excel(str(road_path))
        raw_drainage = parse_drainage_excel(str(drainage_path))
        raw_water = parse_water_excel(str(water_path))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected Excel parsing error: {str(e)}")

    # 2. Validate Row Math
    v_road = validate_road_data(raw_road)
    v_drainage = validate_drainage_data(raw_drainage)
    v_water = validate_water_data(raw_water)

    all_warnings = v_road["warnings"] + v_drainage["warnings"] + v_water["warnings"]

    # 3. Compute Stats
    road_stats = compute_road_stats(v_road["rows"])
    drainage_stats = compute_drainage_stats(v_drainage["rows"])
    water_stats = compute_water_stats(v_water["rows"])

    # 4. Generate Matplotlib Charts
    chart_dir = session_upload_dir / "charts"
    chart_dir.mkdir(parents=True, exist_ok=True)

    road_chart_path = generate_road_chart(road_stats, str(chart_dir / "road_chart.png"))
    drainage_charts = generate_drainage_charts(drainage_stats, str(chart_dir))
    water_chart_path = generate_water_chart(water_stats, str(chart_dir / "water_chart.png"))

    chart_paths = {
        "road_chart": road_chart_path,
        "drainage_cat": drainage_charts["cat_breakdown"],
        "drainage_total": drainage_charts["total_volume"],
        "water_chart": water_chart_path
    }

    # 5. Build PPT Presentation
    ppt_filename = f"CCRS_CRM_Report_{session_id}.pptx"
    ppt_path = GENERATED_DIR / ppt_filename
    build_ppt_presentation(
        road_stats=road_stats,
        drainage_stats=drainage_stats,
        water_stats=water_stats,
        chart_paths=chart_paths,
        date_range=date_range,
        output_ppt_path=str(ppt_path)
    )

    # 6. Save to Database
    report_record = {
        "created_at": datetime.datetime.utcnow().isoformat(),
        "date_range": date_range,
        "uploaded_filenames": {
            "road": road_file.filename,
            "drainage": drainage_file.filename,
            "water": water_file.filename
        },
        "road_stats": road_stats,
        "drainage_stats": drainage_stats,
        "water_stats": water_stats,
        "warnings": all_warnings,
        "ppt_filename": ppt_filename
    }

    report_id = await db_instance.save_report(report_record)

    return {
        "report_id": report_id,
        "message": "Report generated successfully",
        "date_range": date_range,
        "warnings": all_warnings,
        "road_stats": road_stats,
        "drainage_stats": drainage_stats,
        "water_stats": water_stats,
        "ppt_download_url": f"/api/reports/{report_id}/download"
    }


@app.get("/api/reports")
async def get_reports_history():
    reports = await db_instance.list_reports(limit=50)
    summary_list = []
    for r in reports:
        summary_list.append({
            "id": r.get("id", str(r.get("_id", ""))),
            "created_at": r.get("created_at"),
            "date_range": r.get("date_range"),
            "uploaded_filenames": r.get("uploaded_filenames"),
            "warnings_count": len(r.get("warnings", [])),
            "road_grand_total": r.get("road_stats", {}).get("grand_total", 0),
            "drainage_grand_total": r.get("drainage_stats", {}).get("grand_total", 0),
            "water_total_open": r.get("water_stats", {}).get("total_open", 0),
            "ppt_download_url": f"/api/reports/{r.get('id', str(r.get('_id', '')))}/download"
        })
    return summary_list


@app.get("/api/reports/{report_id}")
async def get_report_detail(report_id: str):
    report = await db_instance.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report["ppt_download_url"] = f"/api/reports/{report_id}/download"
    return report


@app.get("/api/reports/{report_id}/download")
async def download_report_ppt(report_id: str):
    report = await db_instance.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    ppt_filename = report.get("ppt_filename")
    if not ppt_filename:
        raise HTTPException(status_code=404, detail="PPT file record missing")

    file_path = GENERATED_DIR / ppt_filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="PPT file not found on disk")

    return FileResponse(
        path=file_path,
        filename=f"CCRS_Complaints_Report_{report_id[:6]}.pptx",
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
