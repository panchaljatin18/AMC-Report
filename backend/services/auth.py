import hmac
import hashlib
import time
import os
import secrets
from typing import Dict, Any, Optional, Tuple

AUTH_SECRET = os.getenv("AUTH_SECRET", "amc_ccrs_crm_super_secure_jwt_secret_2026").strip()

def hash_password(password: str) -> str:
    """
    Hashes a password with a cryptographically secure random salt using PBKDF2-HMAC-SHA256 (100,000 iterations).
    """
    salt = secrets.token_hex(16)
    pw_bytes = password.strip().encode("utf-8")
    key = hashlib.pbkdf2_hmac("sha256", pw_bytes, salt.encode("utf-8"), 100000)
    return f"pbkdf2_sha256${salt}${key.hex()}"

def verify_password_hash(plain_password: str, stored_hash: str) -> bool:
    """
    Verifies plain password against stored salt and hash using constant-time comparison.
    """
    if not plain_password or not stored_hash or "$" not in stored_hash:
        return False
    try:
        algorithm, salt, expected_hex = stored_hash.split("$", 2)
        if algorithm != "pbkdf2_sha256":
            return False
        pw_bytes = plain_password.strip().encode("utf-8")
        calc_key = hashlib.pbkdf2_hmac("sha256", pw_bytes, salt.encode("utf-8"), 100000)
        return hmac.compare_digest(calc_key.hex(), expected_hex)
    except Exception:
        return False

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
        "username": username,
        "name": username,
        "role": "Chief Administrator",
        "department": "AMC CCRS Command & Control",
        "authenticated": True
    }
