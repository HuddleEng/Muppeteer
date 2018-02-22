#!/bin/bash

# The majority of these settings are taken from the result of `puppeteer.defaultArgs()`
# Some were added, such as ignore SSL certificate errors

su - muppeteer -c "
nohup google-chrome \
	--disable-background-networking \
    --disable-background-timer-throttling \
    --disable-client-side-phishing-detection \
    --disable-default-apps \
    --disable-extensions \
    --disable-hang-monitor \
    --disable-popup-blocking \
    --disable-prompt-on-repost \
    --disable-sync \
    --disable-translate \
    --metrics-recording-only \
    --no-first-run \
    --safebrowsing-disable-auto-update' \
    --enable-automation' \
    --password-store=basic' \
    --use-mock-keychain' \
    --headless \
    --ignore-certificate-errors \
    --ignore-ssl-errors \
    --ignore-certificate-errors-spki-list \
    --remote-debugging-port=9222 \
    --remote-debugging-address=0.0.0.0 \
    --user-data-dir=/tmp \
"



