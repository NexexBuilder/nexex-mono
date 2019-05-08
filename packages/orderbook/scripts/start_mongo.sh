#!/usr/bin/env bash
docker run --name ob-mongo -d -p 27017:27017 --rm -v $(pwd)/storage:/data/db mongo:4.0
