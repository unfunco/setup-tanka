// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core'
import * as tanka from './tanka.ts'

export async function main(): Promise<void> {
  try {
    const { cacheHit, version } = await tanka.install(
      core.getInput('tanka-version'),
      core.getInput('token'),
    )

    core.setOutput('cache-hit', cacheHit)
    core.setOutput('tanka-version', version)
  } catch (e: unknown) {
    core.setFailed(e instanceof Error ? e.message : String(e))
  }
}
