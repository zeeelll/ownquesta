from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response

REQUEST_COUNT = Counter("ownquesta_predict_requests_total", "Total number of /predict requests")
REQUEST_LATENCY = Histogram("ownquesta_predict_latency_seconds", "Latency of /predict endpoint")
PREDICTION_GAUGE = Gauge("ownquesta_last_prediction", "Last prediction value")


def metrics_endpoint() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
