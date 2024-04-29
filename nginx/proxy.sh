#!/bin/sh
docker run  --network cdamn \
            --name nginx-proxy \
            -v /var/run/docker.sock:/var/run/docker.sock:ro \
            -p 80:80 \
            -d --restart always mesudip/nginx-proxy