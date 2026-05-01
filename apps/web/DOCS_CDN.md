# Cloud CDN Setup for Votexa

Follow these commands to enable Cloud CDN on your Cloud Run backend.

### 1. Enable APIs
```bash
gcloud services enable compute.googleapis.com
```

### 2. Create a Backend Service for Cloud Run
```bash
# Create a serverless network endpoint group (NEG)
gcloud compute network-endpoint-groups create votexa-neg \
    --region=us-central1 \
    --network-endpoint-type=serverless \
    --cloud-run-service=votexa-web

# Create the backend service with CDN enabled
gcloud compute backend-services create votexa-backend-service \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --global \
    --enable-cdn \
    --cache-mode=CACHE_ALL_STATIC
```

### 3. Setup URL Maps and Frontend
```bash
# Create URL map
gcloud compute url-maps create votexa-url-map \
    --default-service votexa-backend-service

# Create target HTTP proxy
gcloud compute target-http-proxies create votexa-http-proxy \
    --url-map votexa-url-map

# Create global forwarding rule
gcloud compute forwarding-rules create votexa-forwarding-rule \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --network-tier=PREMIUM \
    --address=votexa-static-ip \
    --global \
    --target-http-proxy=votexa-http-proxy \
    --ports=80
```
