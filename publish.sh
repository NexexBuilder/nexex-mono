#!/usr/bin/env bash
lerna exec 'cd dist && cpx ../package.json . && npm publish' --scope={@nexex/api,@nexex/orderbook,@nexex/orderbook-client,@nexex/types}
lerna exec 'npm publish' --scope=@nexex/cli
