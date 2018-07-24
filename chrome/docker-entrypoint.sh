#!/bin/bash

# Source: https://dev.to/bufferings/access-host-from-a-docker-container-4099
# HOST_DOMAIN="host.docker.internal"
# ping -q -c1 $HOST_DOMAIN > /dev/null 2>&1
# if [ $? -ne 0 ]; then
#   HOST_IP=$(ip route | awk 'NR==1 {print $3}')
#   echo -e "$HOST_IP\t$HOST_DOMAIN" >> /etc/hosts
# fi

RUN ip -4 route list match 0/0 | awk '{print $3 "host.docker.internal"}' >> /etc/hosts