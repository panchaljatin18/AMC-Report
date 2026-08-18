import hmac
import hashlib
import time
import os
from typing import Dict, Any, Optional

# Authorized Credentials Configuration
VALID_USERNAME = os.getenv("ADMIN_USERNAME", "Jatin Panchal").strip()
VALID_PASSWORD = os.getenv("ADMIN_PASSWORD", "Jatin@1234").strip()
AUTH_SECRET = os.getenv("AUTH_SECRET", "amc_ccrs_crm_super_secure_jwt_secret_2026").strip()

def verify_credentials(username: str, password: str) -> bool:
    if not username or not password:
        return False
    # Case-insensitive username check for smooth officer UX
    is_user_match = username.strip().lower() == VALID_USERNAME.lower()
    # Constant-time comparison for password security
    is_pass_match = hmac.compare_digest(password.strip(), VALID_PASSWORD)
    return is_user_match and is_pass_match

def generate_session_token(username: str) -> str:
    timestamp = str(int(time.time()))
    payload = f"{username.strip()}:{timestamp}"
    signature = hmac.new(AUTH_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"

def verify_session_token(token: str) -> Optional[Dict[str, Any]]:
    if not token or ":" not in token:
        return None
    parts = token.split(":")
    if len(parts) != 3:
        return None
    username, timestamp, signature = parts
    payload = f"{username}:{timestamp}"
    expected_sig = hmac.new(AUTH_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected_sig):
        return None
    
    # Token valid for 30 days
    try:
        ts = int(timestamp)
        if time.time() - ts > (30 * 24 * 3600):
            return None
    except ValueError:
        return None

    return {
        "username": VALID_USERNAME,
        "name": VALID_USERNAME,
        "role": "Chief Administrator",
        "department": "AMC CCRS Command & Control",
        "authenticated": True
    }
