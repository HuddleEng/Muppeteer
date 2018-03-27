#!/bin/bash
set -e

if [ -z "$1" ]; then
    # get latest tag for repo (auth token not needed for this API)
    LATEST_TAG=$(curl -s https://hub.docker.com/v2/repositories/alpeware/chrome-headless-stable/tags/ | jq -r ".results|.[1].name")
else 
    LATEST_TAG="ver-$1"
fi

sed -i "" "s/:.*/:$LATEST_TAG/g" chrome/Dockerfile
echo "Chrome version set to $LATEST_TAG"