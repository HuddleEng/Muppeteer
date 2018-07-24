FROM alpeware/chrome-headless-stable:ver-67.0.3396.79
EXPOSE 9222
LABEL maintainer="info@alpeware.com"

ONBUILD ADD . /opt/scripts
ONBUILD WORKDIR /opt/scripts
ONBUILD RUN apt-get update && apt-get install -y \
    iputils-ping \
    iproute2 \
    curl \
    && rm -rf /var/lib/apt/lists/*
ONBUILD RUN ./docker-entrypoint.sh