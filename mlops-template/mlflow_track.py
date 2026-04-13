import mlflow
import os
from typing import Dict, Any

MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5000")


def track_model_run(model_name: str, params: Dict[str, Any], metrics: Dict[str, float], artifact_path: str = "model"):
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    mlflow.set_experiment("ownquesta-mlops")

    with mlflow.start_run(run_name=model_name):
        mlflow.log_params(params)
        mlflow.log_metrics(metrics)
        if os.path.exists(artifact_path):
            mlflow.log_artifacts(artifact_path, artifact_path="artifacts")
        mlflow.set_tag("stage", "production-ready")
