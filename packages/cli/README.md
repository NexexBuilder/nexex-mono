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
@nexex/cli/0.1.8 darwin-x64 node-v10.12.0
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
* [`nexex-cli market:list`](#nexex-cli-marketlist)
* [`nexex-cli token:addToken [TOKEN]`](#nexex-cli-tokenaddtoken-token)
* [`nexex-cli token:approve [TOKEN]`](#nexex-cli-tokenapprove-token)
* [`nexex-cli token:eth2weth [AMOUNT]`](#nexex-cli-tokeneth2weth-amount)
* [`nexex-cli token:revoke [TOKEN]`](#nexex-cli-tokenrevoke-token)
* [`nexex-cli token:show`](#nexex-cli-tokenshow)
* [`nexex-cli token:weth2eth [AMOUNT]`](#nexex-cli-tokenweth2eth-amount)
* [`nexex-cli wallet:import [PK]`](#nexex-cli-walletimport-pk)
* [`nexex-cli wallet:show`](#nexex-cli-walletshow)

## `nexex-cli config:del [KEY]`

describe the command here

```
USAGE
  $ nexex-cli config:del [KEY]

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/config/del.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/config/del.ts)_

## `nexex-cli config:get [KEY]`

describe the command here

```
USAGE
  $ nexex-cli config:get [KEY]

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/config/get.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/config/get.ts)_

## `nexex-cli config:list [FILE]`

describe the command here

```
USAGE
  $ nexex-cli config:list [FILE]

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/config/list.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/config/list.ts)_

## `nexex-cli config:set [KEY] [VALUE]`

describe the command here

```
USAGE
  $ nexex-cli config:set [KEY] [VALUE]

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/config/set.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/config/set.ts)_

## `nexex-cli daemon:start`

describe the command here

```
USAGE
  $ nexex-cli daemon:start

OPTIONS
  -c, --config=config
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/daemon/start.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/daemon/start.ts)_

## `nexex-cli daemon:status`

describe the command here

```
USAGE
  $ nexex-cli daemon:status

OPTIONS
  -c, --config=config
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/daemon/status.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/daemon/status.ts)_

## `nexex-cli daemon:stop`

describe the command here

```
USAGE
  $ nexex-cli daemon:stop

OPTIONS
  -c, --config=config
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/daemon/stop.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/daemon/stop.ts)_

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

## `nexex-cli market:list`

describe the command here

```
USAGE
  $ nexex-cli market:list

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/market/list.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/market/list.ts)_

## `nexex-cli token:addToken [TOKEN]`

describe the command here

```
USAGE
  $ nexex-cli token:addToken [TOKEN]

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/addToken.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/token/addToken.ts)_

## `nexex-cli token:approve [TOKEN]`

describe the command here

```
USAGE
  $ nexex-cli token:approve [TOKEN]

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/approve.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/token/approve.ts)_

## `nexex-cli token:eth2weth [AMOUNT]`

describe the command here

```
USAGE
  $ nexex-cli token:eth2weth [AMOUNT]

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/eth2weth.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/token/eth2weth.ts)_

## `nexex-cli token:revoke [TOKEN]`

describe the command here

```
USAGE
  $ nexex-cli token:revoke [TOKEN]

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/revoke.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/token/revoke.ts)_

## `nexex-cli token:show`

describe the command here

```
USAGE
  $ nexex-cli token:show

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/show.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/token/show.ts)_

## `nexex-cli token:weth2eth [AMOUNT]`

describe the command here

```
USAGE
  $ nexex-cli token:weth2eth [AMOUNT]

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/token/weth2eth.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/token/weth2eth.ts)_

## `nexex-cli wallet:import [PK]`

describe the command here

```
USAGE
  $ nexex-cli wallet:import [PK]

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/wallet/import.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/wallet/import.ts)_

## `nexex-cli wallet:show`

describe the command here

```
USAGE
  $ nexex-cli wallet:show

OPTIONS
  -e, --endpoint=endpoint  [default: http://localhost:3001]
  -h, --help               show CLI help

EXAMPLE
  $ dex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/wallet/show.ts](https://github.com/dexunion5/dex-cli/blob/v0.1.8/src/commands/wallet/show.ts)_
<!-- commandsstop -->
