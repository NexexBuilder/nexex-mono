#!/usr/bin/env bash
export NODE_ENV=production
export PUBLIC_URL=/ui-kovan
yarn build:prod
mkdir dist/config
cp env_settings/config.js dist/config/config.js
