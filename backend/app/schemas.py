from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

class StandardAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique Alert ID")
    source: str = Field(..., description="Monitoring system name (e.g., Prometheus, Grafana)")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Time the alert was generated")
    severity: str = Field(..., description="Severity level: INFO, WARNING, CRITICAL")
    title: str = Field(..., description="Short title of the alert")
    description: str = Field(..., description="Detailed description or raw log content")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional arbitrary metadata (e.g., host, labels)")
