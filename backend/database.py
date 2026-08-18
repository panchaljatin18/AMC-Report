import json
import uuid
import datetime
import logging
from pathlib import Path

try:
    from backend.config import MONGODB_URL, DATABASE_NAME, JSON_FALLBACK_FILE
    from backend.services.security import validate_resource_id
except ImportError:
    from config import MONGODB_URL, DATABASE_NAME, JSON_FALLBACK_FILE
    from services.security import validate_resource_id

try:
    from motor.motor_asyncio import AsyncIOMotorClient
    MONGO_AVAILABLE = True
except ImportError:
    MONGO_AVAILABLE = False

logger = logging.getLogger("database")

class ReportsDatabase:
    def __init__(self):
        self.use_mongo = False
        self.client = None
        self.db = None
        if MONGO_AVAILABLE and MONGODB_URL:
            try:
                self.client = AsyncIOMotorClient(
                    MONGODB_URL,
                    serverSelectionTimeoutMS=2500,
                    connectTimeoutMS=2500,
                    socketTimeoutMS=2500
                )
                self.db = self.client[DATABASE_NAME]
                self.use_mongo = True
            except Exception as e:
                logger.warning(f"MongoDB Atlas initialization skipped/failed, using local fallback.")
                self.use_mongo = False

    def _read_fallback(self):
        if not JSON_FALLBACK_FILE.exists():
            return []
        try:
            with open(JSON_FALLBACK_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _write_fallback(self, data):
        try:
            with open(JSON_FALLBACK_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            logger.error("Failed to write to JSON fallback storage.")

    async def save_report(self, report_data: dict) -> str:
        report_id = str(uuid.uuid4())
        report_data["_id"] = report_id
        report_data["id"] = report_id
        if "created_at" not in report_data:
            report_data["created_at"] = datetime.datetime.utcnow().isoformat()

        saved_to_mongo = False
        if self.use_mongo and self.db is not None:
            try:
                await self.db.reports.insert_one(dict(report_data))
                saved_to_mongo = True
            except Exception as e:
                logger.warning("MongoDB write failed, writing to fallback JSON.")

        # Always maintain fallback cache for high reliability
        reports = self._read_fallback()
        reports.insert(0, report_data)
        self._write_fallback(reports)
        return report_id

    async def get_report(self, report_id: str) -> dict | None:
        # Validate ID format to prevent NoSQL operator injection
        clean_id = validate_resource_id(report_id)

        if self.use_mongo and self.db is not None:
            try:
                doc = await self.db.reports.find_one({"_id": clean_id})
                if not doc:
                    doc = await self.db.reports.find_one({"id": clean_id})
                if doc:
                    doc["id"] = str(doc.get("_id", clean_id))
                    return doc
            except Exception:
                pass

        reports = self._read_fallback()
        for r in reports:
            if str(r.get("_id")) == clean_id or str(r.get("id")) == clean_id:
                return r
        return None

    async def list_reports(self, limit: int = 50) -> list:
        safe_limit = max(1, min(limit, 100))
        if self.use_mongo and self.db is not None:
            try:
                cursor = self.db.reports.find().sort("created_at", -1).limit(safe_limit)
                docs = await cursor.to_list(length=safe_limit)
                for doc in docs:
                    doc["id"] = str(doc.get("_id", ""))
                return docs
            except Exception:
                pass

        reports = self._read_fallback()
        return reports[:safe_limit]

db_instance = ReportsDatabase()
