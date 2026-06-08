import json
import os
import time
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

STATUS_FILE = "groq_keys_status.json"
COOLDOWN_SECONDS = 24 * 60 * 60  # 24 hours

class GroqKeyManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GroqKeyManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        # Parse the keys from settings
        raw_keys = settings.GROQ_API_KEY
        print(f"[DEBUG GroqKeyManager] raw_keys from settings: {raw_keys}", flush=True)
        if not raw_keys:
            self.keys = []
        else:
            self.keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
        
        print(f"[DEBUG GroqKeyManager] Parsed {len(self.keys)} keys: {self.keys}", flush=True)
        
        self.status_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), STATUS_FILE)

    def _load_status(self) -> dict:
        """Loads the status of keys from the JSON file. Returns a dict mapping key to failed_timestamp."""
        if not os.path.exists(self.status_file_path):
            return {}
        try:
            with open(self.status_file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading {self.status_file_path}: {e}")
            return {}

    def _save_status(self, status: dict):
        """Saves the status of keys to the JSON file."""
        try:
            with open(self.status_file_path, "w", encoding="utf-8") as f:
                json.dump(status, f, indent=4)
        except Exception as e:
            logger.error(f"Error writing to {self.status_file_path}: {e}")

    def get_all_keys(self) -> list:
        return self.keys

    def get_active_key(self) -> str:
        """
        Returns the first available API key.
        If a key has failed, it checks if the cooldown period (24h) has passed.
        If passed, it revives the key.
        """
        if not self.keys:
            raise ValueError("No GROQ API keys configured.")

        status = self._load_status()
        current_time = time.time()
        status_changed = False
        
        print(f"[DEBUG GroqKeyManager] get_active_key called. Current keys: {self.keys}, Status: {status}", flush=True)

        for key in self.keys:
            if key in status:
                failed_time = status[key]
                # Check if 24 hours have passed since the failure
                if current_time - failed_time >= COOLDOWN_SECONDS:
                    logger.info("Reviving API key as 24 hours have passed since its failure.")
                    del status[key]
                    status_changed = True
                    active_key = key
                    break
                else:
                    # Still in cooldown
                    continue
            else:
                # Key has no recorded failure, it's active
                active_key = key
                break
        else:
            # If we exit the loop normally, all keys are currently failed
            if status_changed:
                self._save_status(status)
            raise RuntimeError("All GROQ API keys are currently exhausted or rate-limited. Please wait or add new keys.")

        if status_changed:
            self._save_status(status)

        return active_key

    def mark_key_failed(self, key: str):
        """Marks the given key as failed by recording the current timestamp."""
        print(f"[DEBUG GroqKeyManager] mark_key_failed called for key: {key}", flush=True)
        status = self._load_status()
        status[key] = time.time()
        self._save_status(status)
        logger.warning("GROQ API key marked as failed.")

api_key_manager = GroqKeyManager()
