FROM alpeware/chrome-headless-stable:ver-67.0.3396.79
EXPOSE 9222
LABEL maintainer="info@alpeware.com"

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN ./usr/local/bin/docker-entrypoint.sh

