#!/bin/bash

# Apply the deployment and service configuration
echo "Applying deployment and service..."
kubectl apply -f deployment.yaml

# Wait for pods to be ready
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=app --timeout=120s

# Get the list of pods
echo "Getting list of pods..."
kubectl get pods -l app=app

# Check pod details and probes
echo "Describing pod details..."
kubectl describe pod -l app=app

# Get logs for the application pod
echo "Fetching logs from the pod..."
kubectl logs -l app=app

echo "Automation process completed!"
