import json
import uuid
import datetime
from pathlib import Path
try:
    from backend.config import MONGODB_URL, DATABASE_NAME, JSON_FALLBACK_FILE
except ImportError:
    from config import MONGODB_URL, DATABASE_NAME, JSON_FALLBACK_FILE

try:
    from motor.motor_asyncio import AsyncIOMotorClient
    MONGO_AVAILABLE = True
except ImportError:
    MONGO_AVAILABLE = False


class ReportsDatabase:
    def __init__(self):
        self.use_mongo = False
        self.client = None
        self.db = None
        if MONGO_AVAILABLE:
            try:
                self.client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=1000)
                self.db = self.client[DATABASE_NAME]
                self.use_mongo = True
            except Exception:
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
        with open(JSON_FALLBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

    async def save_report(self, report_data: dict) -> str:
        report_id = str(uuid.uuid4())
        report_data["_id"] = report_id
        report_data["id"] = report_id
        if "created_at" not in report_data:
            report_data["created_at"] = datetime.datetime.utcnow().isoformat()

        if self.use_mongo and self.db is not None:
            try:
                await self.db.reports.insert_one(dict(report_data))
                return report_id
            except Exception:
                # Fallback if Mongo connection drops
                pass

        reports = self._read_fallback()
        reports.insert(0, report_data)
        self._write_fallback(reports)
        return report_id

    async def get_report(self, report_id: str) -> dict | None:
        if self.use_mongo and self.db is not None:
            try:
                doc = await self.db.reports.find_one({"_id": report_id})
                if doc:
                    doc["id"] = doc["_id"]
                    return doc
            except Exception:
                pass

        reports = self._read_fallback()
        for r in reports:
            if r.get("_id") == report_id or r.get("id") == report_id:
                return r
        return None

    async def list_reports(self, limit: int = 50) -> list:
        if self.use_mongo and self.db is not None:
            try:
                cursor = self.db.reports.find().sort("created_at", -1).limit(limit)
                docs = await cursor.to_list(length=limit)
                for doc in docs:
                    doc["id"] = str(doc.get("_id", ""))
                return docs
            except Exception:
                pass

        reports = self._read_fallback()
        return reports[:limit]

db_instance = ReportsDatabase()
