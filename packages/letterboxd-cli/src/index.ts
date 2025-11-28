#!/usr/bin/env node
/**
 * Letterboxd CLI - Command line interface for the Letterboxd API
 */

import { Command } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Console, Effect } from 'effect'

// TODO: Implement Letterboxd CLI commands

const letterboxd = Command.make(
  'letterboxd',
  {},
  () => Console.log('Letterboxd CLI - Use --help for available commands'),
)

const cli = Command.run(letterboxd, {
  name: 'Letterboxd CLI',
  version: 'v0.1.0',
})

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
