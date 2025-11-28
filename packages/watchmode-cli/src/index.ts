#!/usr/bin/env node
/**
 * Watchmode CLI - Command line interface for the Watchmode API
 */

import { Command } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Console, Effect } from 'effect'

// TODO: Implement Watchmode CLI commands

const watchmode = Command.make('watchmode', {}, () => Console.log('Watchmode CLI - Use --help for available commands'))

const cli = Command.run(watchmode, {
  name: 'Watchmode CLI',
  version: 'v0.1.0',
})

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
