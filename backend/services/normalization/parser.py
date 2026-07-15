from services.normalization.drain3_engine import drain3_engine

def normalize_alert(raw_alert: dict) -> dict:
    description = raw_alert.get("description", "")
    
    # Use Drain3 to extract template and variables
    drain_result = drain3_engine.extract_template(description)
    
    normalized_payload = {
        "id": raw_alert.get("id"),
        "source": raw_alert.get("source"),
        "timestamp": raw_alert.get("timestamp"),
        "severity": raw_alert.get("severity").upper() if raw_alert.get("severity") else "UNKNOWN",
        "title": raw_alert.get("title"),
        "original_description": description,
        "normalized_template": drain_result["template"],
        "drain3_cluster_id": drain_result["cluster_id"],
        "extracted_variables": drain_result["variables"],
        "metadata": raw_alert.get("metadata", {})
    }
    
    return normalized_payload
