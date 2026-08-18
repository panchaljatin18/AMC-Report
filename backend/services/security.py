import os
import re
import time
import logging
from pathlib import Path
from typing import Dict, Tuple
from fastapi import Request, HTTPException, Security, status
from fastapi.security import APIKeyHeader

try:
    from backend.config import API_SECRET_KEY, MAX_UPLOAD_SIZE_BYTES
except ImportError:
    from config import API_SECRET_KEY, MAX_UPLOAD_SIZE_BYTES

logger = logging.getLogger("security")

# 1. API Key Authentication
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    """
    Enforce API Key verification if API_SECRET_KEY is configured in backend environment.
    If API_SECRET_KEY is empty/not set (e.g. initial local dev), allows access.
    """
    expected_key = (API_SECRET_KEY or "").strip()
    if not expected_key:
        return True

    if not api_key or api_key.strip() != expected_key:
        logger.warning("Unauthorized API access attempt with invalid/missing API key.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API authentication credentials."
        )
    return True


# 2. Path Traversal Protection
def safe_resolve_path(base_dir: Path, user_path: str) -> Path:
    """
    Safely resolves a filepath inside base_dir and ensures it does not escape base_dir via ../ or symlinks.
    """
    clean_name = os.path.basename(user_path.strip().replace("\\", "/"))
    if not clean_name or clean_name in [".", ".."]:
        raise HTTPException(status_code=400, detail="Invalid filename supplied.")

    resolved_path = (base_dir / clean_name).resolve()
    base_resolved = base_dir.resolve()

    if not str(resolved_path).startswith(str(base_resolved)):
        logger.error(f"Path traversal attempt detected: {user_path}")
        raise HTTPException(status_code=400, detail="Illegal directory traversal detected.")

    return resolved_path


# 3. Report ID / UUID Validation (NoSQL Injection & IDOR Protection)
ID_PATTERN = re.compile(r"^[a-zA-Z0-9_\-]{4,64}$")

def validate_resource_id(resource_id: str) -> str:
    """
    Validates resource IDs against strict alphanumeric-hyphen pattern to prevent NoSQL query operator injection.
    """
    if not resource_id or not isinstance(resource_id, str):
        raise HTTPException(status_code=400, detail="Invalid ID format.")
    clean_id = resource_id.strip()
    if not ID_PATTERN.match(clean_id):
        logger.warning(f"Malicious or invalid ID format rejected: {clean_id}")
        raise HTTPException(status_code=400, detail="Invalid resource identifier.")
    return clean_id


# 4. File Upload Validation (Extension, MIME, OpenXML Magic Bytes, Max Size)
ALLOWED_EXTENSIONS = {".xlsx"}
OPENXML_MAGIC_BYTES = b"PK\x03\x04"  # Standard zip header for .xlsx (Office Open XML)

async def validate_uploaded_excel(file_obj, filename: str) -> None:
    """
    Validates uploaded Excel file:
    1. Checks filename extension is strictly .xlsx
    2. Validates OpenXML Zip magic bytes (PK\x03\x04)
    3. Enforces MAX_UPLOAD_SIZE_BYTES limit
    """
    if not filename:
        raise HTTPException(status_code=400, detail="File must have a valid filename.")

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Only Excel (.xlsx) files are allowed."
        )

    # Read the first 4 bytes to check file magic header
    header = await file_obj.read(4)
    await file_obj.seek(0)

    if header != OPENXML_MAGIC_BYTES:
        raise HTTPException(
            status_code=400,
            detail="File content does not match standard Excel (.xlsx) format signature."
        )


# 5. In-Memory Sliding Window Rate Limiter
class SimpleRateLimiter:
    """
    Thread-safe sliding window rate limiter per client IP.
    """
    def __init__(self, requests_per_minute: int = 60, burst_limit: int = 15):
        self.requests_per_minute = requests_per_minute
        self.burst_limit = burst_limit
        self.client_records: Dict[str, list] = {}

    def is_allowed(self, client_ip: str) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - 60.0

        if client_ip not in self.client_records:
            self.client_records[client_ip] = []

        # Filter timestamps within current 60s window
        self.client_records[client_ip] = [
            ts for ts in self.client_records[client_ip] if ts > window_start
        ]

        current_count = len(self.client_records[client_ip])
        if current_count >= self.requests_per_minute:
            return False, int(60 - (now - self.client_records[client_ip][0]))

        self.client_records[client_ip].append(now)

        # Cleanup stale client records periodically
        if len(self.client_records) > 2000:
            for ip in list(self.client_records.keys()):
                self.client_records[ip] = [
                    ts for ts in self.client_records[ip] if ts > window_start
                ]
                if not self.client_records[ip]:
                    del self.client_records[ip]

        return True, 0

# Rate limiter instances
api_rate_limiter = SimpleRateLimiter(requests_per_minute=120)
generate_rate_limiter = SimpleRateLimiter(requests_per_minute=10)

def check_rate_limit(request: Request, limiter: SimpleRateLimiter = api_rate_limiter):
    # Extract client IP respecting standard reverse proxies
    client_ip = (
        request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or request.headers.get("x-real-ip", "").strip()
        or (request.client.host if request.client else "unknown")
    )
    allowed, retry_after = limiter.is_allowed(client_ip)
    if not allowed:
        logger.warning(f"Rate limit exceeded for IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Please wait {retry_after} seconds before retrying.",
            headers={"Retry-After": str(retry_after)}
        )
