#!/bin/bash
# Start FastAPI with Uvicorn

export DYNAMODB_TABLE=${DYNAMODB_TABLE:-"app-data-table"}
export AWS_REGION=${AWS_REGION:-"ap-south-1"}

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
