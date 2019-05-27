@nexex/cli
=======



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@nexex/cli.svg)](https://npmjs.org/package/@nexex/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@nexex/cli.svg)](https://npmjs.org/package/@nexex/cli)
[![License](https://img.shields.io/npm/l/@nexex/cli.svg)](https://github.com/NexexBuilder/nexex-mono/blob/master/packages/cli/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @nexex/cli
$ nexex-cli COMMAND
running command...
$ nexex-cli (-v|--version|version)
@nexex/cli/0.2.2 darwin-x64 node-v10.12.0
$ nexex-cli --help [COMMAND]
USAGE
  $ nexex-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`nexex-cli config:del [KEY]`](#nexex-cli-configdel-key)
* [`nexex-cli config:get [KEY]`](#nexex-cli-configget-key)
* [`nexex-cli config:list [FILE]`](#nexex-cli-configlist-file)
* [`nexex-cli config:set [KEY] [VALUE]`](#nexex-cli-configset-key-value)
* [`nexex-cli daemon:start`](#nexex-cli-daemonstart)
* [`nexex-cli daemon:status`](#nexex-cli-daemonstatus)
* [`nexex-cli daemon:stop`](#nexex-cli-daemonstop)
* [`nexex-cli help [COMMAND]`](#nexex-cli-help-command)
* [`nexex-cli market:buy`](#nexex-cli-marketbuy)
* [`nexex-cli market:cancel ORDERHASH [AMOUNT]`](#nexex-cli-marketcancel-orderhash-amount)
* [`nexex-cli market:list`](#nexex-cli-marketlist)
* [`nexex-cli market:order`](#nexex-cli-marketorder)
* [`nexex-cli market:sell`](#nexex-cli-marketsell)
* [`nexex-cli market:trade ORDERHASH [AMOUNT]`](#nexex-cli-markettrade-orderhash-amount)
* [`nexex-cli token:add [TOKEN]`](#nexex-cli-tokenadd-token)
* [`nexex-cli token:approve [TOKEN]`](#nexex-cli-tokenapprove-token)
* [`nexex-cli token:eth2weth [AMOUNT]`](#nexex-cli-tokeneth2weth-amount)
* [`nexex-cli token:revoke [TOKEN]`](#nexex-cli-tokenrevoke-token)
* [`nexex-cli token:show`](#nexex-cli-tokenshow)
* [`nexex-cli token:weth2eth [AMOUNT]`](#nexex-cli-tokenweth2eth-amount)
* [`nexex-cli wallet:import [PK]`](#nexex-cli-walletimport-pk)
* [`nexex-cli wallet:show`](#nexex-cli-walletshow)

## `nexex-cli config:del [KEY]`

delete a config item

```
USAGE
  $ nexex-cli config:del [KEY]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
```

_See code: [src/commands/config/del.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/config/del.ts)_

## `nexex-cli config:get [KEY]`

get a config's value

```
USAGE
  $ nexex-cli config:get [KEY]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
```

_See code: [src/commands/config/get.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/config/get.ts)_

## `nexex-cli config:list [FILE]`

list all configs

```
USAGE
  $ nexex-cli config:list [FILE]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
```

_See code: [src/commands/config/list.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/config/list.ts)_

## `nexex-cli config:set [KEY] [VALUE]`

set a config item

```
USAGE
  $ nexex-cli config:set [KEY] [VALUE]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
```

_See code: [src/commands/config/set.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/config/set.ts)_

## `nexex-cli daemon:start`

start a local orderbook service

```
USAGE
  $ nexex-cli daemon:start

OPTIONS
  -a, --showAddr
  -c, --config=config
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
  -m, --market=market      (required)

EXAMPLE
  $ nexex-cli daemon:start
  start a local orderbook service at port 3001
```

_See code: [src/commands/daemon/start.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/daemon/start.ts)_

## `nexex-cli daemon:status`

query status of orderbook service

```
USAGE
  $ nexex-cli daemon:status

OPTIONS
  -a, --showAddr
  -c, --config=config
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
```

_See code: [src/commands/daemon/status.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/daemon/status.ts)_

## `nexex-cli daemon:stop`

stop the services

```
USAGE
  $ nexex-cli daemon:stop

OPTIONS
  -a, --showAddr
  -c, --config=config
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/daemon/stop.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/daemon/stop.ts)_

## `nexex-cli help [COMMAND]`

display help for nexex-cli

```
USAGE
  $ nexex-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `nexex-cli market:buy`

place a buy order to a orderbook relayer

```
USAGE
  $ nexex-cli market:buy

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
  --amount=amount
  --expire=expire
  --market=market
  --price=price

EXAMPLE
  $ nexex-cli market:buy --amount 0.3 --price 0.11 --expire 1d
           Enter the passphrase to use the wallet and sign the order.
```

_See code: [src/commands/market/buy.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/market/buy.ts)_

## `nexex-cli market:cancel ORDERHASH [AMOUNT]`

describe the command here

```
USAGE
  $ nexex-cli market:cancel ORDERHASH [AMOUNT]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
  --market=market

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/market/cancel.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/market/cancel.ts)_

## `nexex-cli market:list`

describe the command here

```
USAGE
  $ nexex-cli market:list

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
  --market=market

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/market/list.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/market/list.ts)_

## `nexex-cli market:order`

query top orders from a relayer

```
USAGE
  $ nexex-cli market:order

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
  -l, --limit=limit        [default: 5]
  --market=market

EXAMPLE
  $ nexex-cli market:order --limit 5
```

_See code: [src/commands/market/order.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/market/order.ts)_

## `nexex-cli market:sell`

place a sell order to a orderbook relayer

```
USAGE
  $ nexex-cli market:sell

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
  --amount=amount
  --expire=expire
  --market=market
  --price=price

EXAMPLE
  $ nexex-cli market:sell --amount 0.3 --price 0.11 --expire 1d
           Enter the passphrase to use the wallet and sign the order.
```

_See code: [src/commands/market/sell.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/market/sell.ts)_

## `nexex-cli market:trade ORDERHASH [AMOUNT]`

describe the command here

```
USAGE
  $ nexex-cli market:trade ORDERHASH [AMOUNT]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help
  --market=market

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/market/trade.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/market/trade.ts)_

## `nexex-cli token:add [TOKEN]`

describe the command here

```
USAGE
  $ nexex-cli token:add [TOKEN]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/add.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/token/add.ts)_

## `nexex-cli token:approve [TOKEN]`

describe the command here

```
USAGE
  $ nexex-cli token:approve [TOKEN]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/approve.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/token/approve.ts)_

## `nexex-cli token:eth2weth [AMOUNT]`

describe the command here

```
USAGE
  $ nexex-cli token:eth2weth [AMOUNT]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/eth2weth.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/token/eth2weth.ts)_

## `nexex-cli token:revoke [TOKEN]`

describe the command here

```
USAGE
  $ nexex-cli token:revoke [TOKEN]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/revoke.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/token/revoke.ts)_

## `nexex-cli token:show`

describe the command here

```
USAGE
  $ nexex-cli token:show

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/show.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/token/show.ts)_

## `nexex-cli token:weth2eth [AMOUNT]`

describe the command here

```
USAGE
  $ nexex-cli token:weth2eth [AMOUNT]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/weth2eth.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/token/weth2eth.ts)_

## `nexex-cli wallet:import [PK]`

describe the command here

```
USAGE
  $ nexex-cli wallet:import [PK]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/wallet/import.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/wallet/import.ts)_

## `nexex-cli wallet:show`

describe the command here

```
USAGE
  $ nexex-cli wallet:show

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/wallet/show.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.2.2/src/commands/wallet/show.ts)_
<!-- commandsstop -->
