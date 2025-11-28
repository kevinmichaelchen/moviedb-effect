#!/usr/bin/env node
/**
 * Trakt CLI - Command line interface for the Trakt API
 */

import { Command } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Console, Effect } from 'effect'

// TODO: Implement Trakt CLI commands

const trakt = Command.make('trakt', {}, () => Console.log('Trakt CLI - Use --help for available commands'))

const cli = Command.run(trakt, {
  name: 'Trakt CLI',
  version: 'v0.1.0',
})

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
