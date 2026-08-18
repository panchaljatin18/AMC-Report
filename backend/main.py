import os
import shutil
import uuid
import datetime
import asyncio
import logging
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

try:
    from backend.config import UPLOAD_DIR, GENERATED_DIR, ALLOWED_ORIGINS, MAX_UPLOAD_SIZE_BYTES
    from backend.database import db_instance
    from backend.services.excel_parser import parse_road_excel, parse_drainage_excel, parse_water_excel
    from backend.services.validator import validate_road_data, validate_drainage_data, validate_water_data
    from backend.services.calculator import compute_road_stats, compute_drainage_stats, compute_water_stats
    from backend.services.chart_generator import generate_road_chart, generate_drainage_charts, generate_water_chart
    from backend.services.ppt_generator import build_ppt_presentation
    from backend.services.sample_generator import generate_sample_excels
    from backend.services.security import (
        verify_api_key,
        safe_resolve_path,
        validate_resource_id,
        validate_uploaded_excel,
        check_rate_limit,
        generate_rate_limiter,
        api_rate_limiter,
    )
    from backend.services.auth import generate_session_token, verify_session_token
except ImportError:
    from config import UPLOAD_DIR, GENERATED_DIR, ALLOWED_ORIGINS, MAX_UPLOAD_SIZE_BYTES
    from database import db_instance
    from services.excel_parser import parse_road_excel, parse_drainage_excel, parse_water_excel
    from services.validator import validate_road_data, validate_drainage_data, validate_water_data
    from services.calculator import compute_road_stats, compute_drainage_stats, compute_water_stats
    from services.chart_generator import generate_road_chart, generate_drainage_charts, generate_water_chart
    from services.ppt_generator import build_ppt_presentation
    from services.sample_generator import generate_sample_excels
    from services.security import (
        verify_api_key,
        safe_resolve_path,
        validate_resource_id,
        validate_uploaded_excel,
        check_rate_limit,
        generate_rate_limiter,
        api_rate_limiter,
    )
    from services.auth import generate_session_token, verify_session_token

app = FastAPI(
    title="CCRS CRM API",
    version="1.0.0",
    docs_url=None,  # Disabled in production to prevent schema/endpoint enumeration
    redoc_url=None,
)

# 1. Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# 2. Strict CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key", "Authorization", "Accept"],
    max_age=600,
)


@app.on_event("startup")
async def startup_event():
    await db_instance.init_default_user()


@app.get("/")
def read_root():
    return {"message": "CCRS CRM API is active", "version": "1.0.0"}


# ─── AUTHENTICATION ENDPOINTS ──────────────────────────────────────────────────

@app.post("/api/auth/login")
async def login(request: Request):
    check_rate_limit(request, api_rate_limiter)
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body.")

    username = str(body.get("username", "")).strip()
    password = str(body.get("password", "")).strip()

    # Authenticate directly against database record
    is_valid, user_record = await db_instance.authenticate_user(username, password)
    if not is_valid or not user_record:
        logger.warning(f"Failed database login attempt for username: {username}")
        raise HTTPException(
            status_code=401,
            detail="Invalid Username or Password. Please verify your credentials."
        )

    user_name = user_record.get("name", "Jatin Panchal")
    token = generate_session_token(user_name)
    logger.info(f"Successful database login for user: {user_name}")
    return {
        "success": True,
        "token": token,
        "user": {
            "name": user_name,
            "username": user_record.get("username", "Jatin Panchal"),
            "role": user_record.get("role", "Chief System Administrator"),
            "department": user_record.get("department", "AMC CCRS Command & Control"),
            "authenticated": True
        }
    }


@app.get("/api/auth/me")
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization", "")
    token = ""
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    elif "X-Auth-Token" in request.headers:
        token = request.headers["X-Auth-Token"].strip()

    user = verify_session_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid token.")
    return user


@app.post("/api/auth/logout")
def logout():
    return {"success": True, "message": "Logged out successfully."}


@app.post("/api/reports/generate-sample-files", dependencies=[Depends(verify_api_key)])
async def create_samples(request: Request):
    check_rate_limit(request, api_rate_limiter)
    sample_dir = UPLOAD_DIR / "samples"
    files = await asyncio.to_thread(generate_sample_excels, sample_dir)
    return {
        "message": "Sample Excel files generated successfully",
        "files": {k: f"/api/reports/sample-files/{v.name}" for k, v in files.items()}
    }


@app.get("/api/reports/sample-files/{filename}", dependencies=[Depends(verify_api_key)])
def download_sample_file(filename: str, request: Request):
    check_rate_limit(request, api_rate_limiter)
    sample_dir = UPLOAD_DIR / "samples"
    try:
        file_path = safe_resolve_path(sample_dir, filename)
    except HTTPException:
        raise HTTPException(status_code=400, detail="Invalid file request.")

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Sample file not found.")

    return FileResponse(
        path=file_path,
        filename=os.path.basename(filename),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


def _process_pipeline(road_path, drainage_path, water_path, date_range, session_id, session_upload_dir):
    # 1. Parse Excel Files
    raw_road = parse_road_excel(str(road_path))
    raw_drainage = parse_drainage_excel(str(drainage_path))
    raw_water = parse_water_excel(str(water_path))

    # 2. Validate Row Math
    v_road = validate_road_data(raw_road)
    v_drainage = validate_drainage_data(raw_drainage)
    v_water = validate_water_data(raw_water)

    all_warnings = v_road["warnings"] + v_drainage["warnings"] + v_water["warnings"]

    # 3. Compute Stats
    road_stats = compute_road_stats(v_road["rows"])
    drainage_stats = compute_drainage_stats(v_drainage["rows"])
    water_stats = compute_water_stats(v_water["rows"])

    # 4. Generate Matplotlib Charts (Fast 140 DPI)
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
    logo_file = Path(__file__).resolve().parent.parent / "frontend" / "public" / "AMC Logo.webp"
    logo_str = str(logo_file) if logo_file.exists() else None

    build_ppt_presentation(
        road_stats=road_stats,
        drainage_stats=drainage_stats,
        water_stats=water_stats,
        chart_paths=chart_paths,
        date_range=date_range,
        output_ppt_path=str(ppt_path),
        logo_path=logo_str
    )

    return {
        "road_stats": road_stats,
        "drainage_stats": drainage_stats,
        "water_stats": water_stats,
        "all_warnings": all_warnings,
        "ppt_filename": ppt_filename
    }


async def _save_upload_file_safe(upload_file: UploadFile, dest_path: Path, max_bytes: int):
    """
    Streams upload file in chunks and enforces max_bytes limit to prevent memory exhaustion DoS.
    """
    bytes_read = 0
    with open(dest_path, "wb") as f:
        while True:
            chunk = await upload_file.read(64 * 1024)
            if not chunk:
                break
            bytes_read += len(chunk)
            if bytes_read > max_bytes:
                dest_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=413,
                    detail=f"Uploaded file exceeds maximum allowed size of {max_bytes // (1024 * 1024)} MB."
                )
            f.write(chunk)


@app.post("/api/reports/generate", dependencies=[Depends(verify_api_key)])
async def generate_report(
    request: Request,
    road_file: UploadFile = File(...),
    drainage_file: UploadFile = File(...),
    water_file: UploadFile = File(...),
    date_range: str = Form("Current Month")
):
    # Enforce Rate Limiting on heavy report generation
    check_rate_limit(request, generate_rate_limiter)

    # Validate file extensions and magic headers
    await validate_uploaded_excel(road_file, road_file.filename)
    await validate_uploaded_excel(drainage_file, drainage_file.filename)
    await validate_uploaded_excel(water_file, water_file.filename)

    # Sanitize date_range parameter
    clean_date_range = "".join(c for c in date_range if c.isalnum() or c in " :-_.,/").strip()[:100] or "Current Month"

    session_id = uuid.uuid4().hex[:12]
    session_upload_dir = UPLOAD_DIR / session_id
    session_upload_dir.mkdir(parents=True, exist_ok=True)

    # Use safe server-generated filenames to prevent arbitrary file writes/traversal
    road_path = session_upload_dir / "road_input.xlsx"
    drainage_path = session_upload_dir / "drainage_input.xlsx"
    water_path = session_upload_dir / "water_input.xlsx"

    try:
        await _save_upload_file_safe(road_file, road_path, MAX_UPLOAD_SIZE_BYTES)
        await _save_upload_file_safe(drainage_file, drainage_path, MAX_UPLOAD_SIZE_BYTES)
        await _save_upload_file_safe(water_file, water_path, MAX_UPLOAD_SIZE_BYTES)
    except HTTPException:
        shutil.rmtree(session_upload_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(session_upload_dir, ignore_errors=True)
        logger.error(f"Error saving upload files: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to save uploaded files securely.")

    try:
        pipeline_res = await asyncio.to_thread(
            _process_pipeline,
            road_path, drainage_path, water_path, clean_date_range, session_id, session_upload_dir
        )
    except ValueError as ve:
        shutil.rmtree(session_upload_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        shutil.rmtree(session_upload_dir, ignore_errors=True)
        logger.error(f"Report generation processing error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while processing the report. Please verify your Excel format.")

    road_stats = pipeline_res["road_stats"]
    drainage_stats = pipeline_res["drainage_stats"]
    water_stats = pipeline_res["water_stats"]
    all_warnings = pipeline_res["all_warnings"]
    ppt_filename = pipeline_res["ppt_filename"]

    # 6. Save to Database
    report_record = {
        "created_at": datetime.datetime.utcnow().isoformat(),
        "date_range": clean_date_range,
        "uploaded_filenames": {
            "road": os.path.basename(road_file.filename)[:100],
            "drainage": os.path.basename(drainage_file.filename)[:100],
            "water": os.path.basename(water_file.filename)[:100]
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
        "date_range": clean_date_range,
        "warnings": all_warnings,
        "road_stats": road_stats,
        "drainage_stats": drainage_stats,
        "water_stats": water_stats,
        "ppt_download_url": f"/api/reports/{report_id}/download"
    }


@app.get("/api/reports", dependencies=[Depends(verify_api_key)])
async def get_reports_history(request: Request):
    check_rate_limit(request, api_rate_limiter)
    reports = await db_instance.list_reports(limit=50)
    summary_list = []
    for r in reports:
        report_id = r.get("id", str(r.get("_id", "")))
        summary_list.append({
            "id": report_id,
            "created_at": r.get("created_at"),
            "date_range": r.get("date_range"),
            "uploaded_filenames": r.get("uploaded_filenames"),
            "warnings_count": len(r.get("warnings", [])),
            "road_grand_total": r.get("road_stats", {}).get("grand_total", 0),
            "drainage_grand_total": r.get("drainage_stats", {}).get("grand_total", 0),
            "water_total_open": r.get("water_stats", {}).get("total_open", 0),
            "ppt_download_url": f"/api/reports/{report_id}/download"
        })
    return summary_list


@app.get("/api/reports/{report_id}", dependencies=[Depends(verify_api_key)])
async def get_report_detail(report_id: str, request: Request):
    check_rate_limit(request, api_rate_limiter)
    clean_id = validate_resource_id(report_id)
    report = await db_instance.get_report(clean_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    report["ppt_download_url"] = f"/api/reports/{clean_id}/download"
    return report


@app.get("/api/reports/{report_id}/download", dependencies=[Depends(verify_api_key)])
async def download_report_ppt(report_id: str, request: Request):
    check_rate_limit(request, api_rate_limiter)
    clean_id = validate_resource_id(report_id)
    report = await db_instance.get_report(clean_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    ppt_filename = report.get("ppt_filename")
    if not ppt_filename:
        raise HTTPException(status_code=404, detail="Presentation record not found.")

    try:
        file_path = safe_resolve_path(GENERATED_DIR, ppt_filename)
    except HTTPException:
        raise HTTPException(status_code=400, detail="Invalid presentation request.")

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Presentation file not found on server.")

    return FileResponse(
        path=file_path,
        filename=f"CCRS_Complaints_Report_{clean_id[:8]}.pptx",
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
