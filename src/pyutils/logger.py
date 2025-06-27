import logging
import os
from datetime import datetime

import structlog

LOG_DIR = os.getenv("LOG_DIR", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

timestamp = datetime.utcnow().strftime("%Y-%m-%d-%H")
file_path = os.path.join(LOG_DIR, f"runtime-{timestamp}.json")
file_handler = logging.FileHandler(file_path)
file_handler.setFormatter(logging.Formatter("%(message)s"))

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(message)s",
    handlers=[logging.StreamHandler(), file_handler],
)

structlog.configure(
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    logger_factory=structlog.stdlib.LoggerFactory(),
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
)

logger = structlog.get_logger()
