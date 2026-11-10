// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core'
import * as tanka from './tanka.ts'

export async function main(): Promise<void> {
  try {
    await tanka.install(core.getInput('tanka-version'), core.getInput('token'))
  } catch (e: unknown) {
    core.setFailed(e instanceof Error ? e.message : String(e))
  }
}
