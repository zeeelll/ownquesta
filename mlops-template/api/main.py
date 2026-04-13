from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import os
import pickle
import numpy as np

from monitoring import REQUEST_COUNT, REQUEST_LATENCY, PREDICTION_GAUGE, metrics_endpoint

app = FastAPI(title="Ownquesta MLOps Inference", version="1.0.0")
MODEL_PATH = os.getenv("MODEL_PATH", "/app/model/model.pkl")


class PredictRequest(BaseModel):
    features: List[float] = Field(..., min_length=1)


class PredictResponse(BaseModel):
    prediction: float


def load_model(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found at {path}")
    with open(path, "rb") as f:
        return pickle.load(f)


model = load_model(MODEL_PATH)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/metrics")
def metrics():
    return metrics_endpoint()


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    REQUEST_COUNT.inc()
    with REQUEST_LATENCY.time():
        try:
            x = np.array(payload.features, dtype=float).reshape(1, -1)
            pred = model.predict(x)
            value = float(pred[0])
            PREDICTION_GAUGE.set(value)
            return PredictResponse(prediction=value)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Prediction failed: {exc}") from exc
