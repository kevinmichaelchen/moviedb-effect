#!/usr/bin/env node
/**
 * OMDb CLI - Command line interface for the OMDb API
 */

import { Command } from '@effect/cli'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Console, Effect } from 'effect'

// TODO: Implement OMDb CLI commands

const omdb = Command.make('omdb', {}, () => Console.log('OMDb CLI - Use --help for available commands'))

const cli = Command.run(omdb, {
  name: 'OMDb CLI',
  version: 'v0.1.0',
})

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
