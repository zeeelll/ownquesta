FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY api/main.py /app/main.py
COPY mlflow_track.py /app/mlflow_track.py
COPY monitoring.py /app/monitoring.py

RUN pip install --no-cache-dir fastapi uvicorn numpy scikit-learn mlflow prometheus-client

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
