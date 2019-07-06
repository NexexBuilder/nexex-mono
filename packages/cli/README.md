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
@nexex/cli/0.10.6 darwin-x64 node-v10.16.0
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

## `nexex-cli config:del [KEY]`

delete a config item

```
USAGE
  $ nexex-cli config:del [KEY]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: https://kovan-ob.nexex.info]
  -h, --help               show CLI help
```

_See code: [src/commands/config/del.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.10.6/src/commands/config/del.ts)_

## `nexex-cli config:get [KEY]`

get a config's value

```
USAGE
  $ nexex-cli config:get [KEY]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: https://kovan-ob.nexex.info]
  -h, --help               show CLI help
```

_See code: [src/commands/config/get.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.10.6/src/commands/config/get.ts)_

## `nexex-cli config:list [FILE]`

list all configs

```
USAGE
  $ nexex-cli config:list [FILE]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: https://kovan-ob.nexex.info]
  -h, --help               show CLI help
```

_See code: [src/commands/config/list.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.10.6/src/commands/config/list.ts)_

## `nexex-cli config:set [KEY] [VALUE]`

set a config item

```
USAGE
  $ nexex-cli config:set [KEY] [VALUE]

OPTIONS
  -a, --showAddr
  -e, --endpoint=endpoint  [default: https://kovan-ob.nexex.info]
  -h, --help               show CLI help
```

_See code: [src/commands/config/set.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.10.6/src/commands/config/set.ts)_

## `nexex-cli daemon:start`

start a local orderbook service

```
USAGE
  $ nexex-cli daemon:start

OPTIONS
  -a, --showAddr
  -c, --config=config
  -e, --endpoint=endpoint  [default: https://kovan-ob.nexex.info]
  -h, --help               show CLI help
  -m, --market=market      (required)

EXAMPLE
  $ nexex-cli daemon:start
  start a local orderbook service at port 3001
```

_See code: [src/commands/daemon/start.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.10.6/src/commands/daemon/start.ts)_

## `nexex-cli daemon:status`

query status of orderbook service

```
USAGE
  $ nexex-cli daemon:status

OPTIONS
  -a, --showAddr
  -c, --config=config
  -e, --endpoint=endpoint  [default: https://kovan-ob.nexex.info]
  -h, --help               show CLI help
```

_See code: [src/commands/daemon/status.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.10.6/src/commands/daemon/status.ts)_

## `nexex-cli daemon:stop`

stop the services

```
USAGE
  $ nexex-cli daemon:stop

OPTIONS
  -a, --showAddr
  -c, --config=config
  -e, --endpoint=endpoint  [default: https://kovan-ob.nexex.info]
  -h, --help               show CLI help

EXAMPLE
  $ nexex-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/daemon/stop.ts](https://github.com/NexexBuilder/nexex-mono/blob/v0.10.6/src/commands/daemon/stop.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src/commands/help.ts)_
<!-- commandsstop -->
