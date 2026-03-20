// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core'
import * as tanka from './tanka'

export const main = async (): Promise<void> => {
  try {
    const tankaVersion: string = core.getInput('tanka-version')
    await tanka.install(tankaVersion)
  } catch (e: unknown) {
    if (e instanceof Error) {
      core.setFailed(e.message)
    }
  }
}
