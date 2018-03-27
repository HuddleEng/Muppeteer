#!/bin/bash
set -e

if [ -z "$1" ]; then
    # Get latest tag for repo (auth token not needed for this API)
    # jq would be nicer here, but it's an extra dependency (jq -r ".results|.[1].name")
    LATEST_TAG=$(curl -s https://hub.docker.com/v2/repositories/alpeware/chrome-headless-stable/tags/ | python -c 'import json,sys;obj=json.load(sys.stdin);print obj["results"][1]["name"]')
else 
    LATEST_TAG="ver-$1"
fi

# Replace the tag in the Dockerfile
# The bak file is used to deal with `sed` differences across OSs
sed -i.bak "s/:.*/:$LATEST_TAG/g" chrome/Dockerfile && rm chrome/Dockerfile.bak
echo "Chrome version set to $LATEST_TAG"