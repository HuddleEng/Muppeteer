FROM krallin/ubuntu-tini:xenial

EXPOSE 9222

# Install dependencies
RUN apt-get update && \
  apt-get -y upgrade && \
  apt-get install -yq curl libgconf-2-4

# Install Google Chrome
RUN curl https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb stable main' >> /etc/apt/sources.list.d/google-chrome.list && \
  apt-get update && \
  apt-get install -y google-chrome-unstable --no-install-recommends && \
  apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont --no-install-recommends && \
  rm -fr /var/lib/apt/lists/* && \
  apt-get purge --auto-remove -y curl && \
  rm -fr /src/*.deb

COPY entrypoint.sh .

RUN chmod +x ./entrypoint.sh

# Add user so we don't need --no-sandbox.
RUN groupadd -r muppeteer && useradd -r -g muppeteer -G audio,video muppeteer \
    && mkdir -p /home/muppeteer/Downloads \
    && chown -R muppeteer:muppeteer /home/muppeteer

ENTRYPOINT ["/usr/local/bin/tini", "--", "./entrypoint.sh"]