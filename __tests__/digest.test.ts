// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { sha256 } from '../src/digest.ts'

describe('sha256', () => {
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'setup-tanka-'))
  })

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true })
  })

  it('computes the digest of a file', async () => {
    const file = path.join(directory, 'tk')
    await writeFile(file, 'tanka')

    await expect(sha256(file)).resolves.toBe(
      'sha256:43de5202fd037702d20a6993f61487be3302dfaef65b632d3ff85e0b7df5cbac',
    )
  })

  it('rejects when the file does not exist', async () => {
    await expect(sha256(path.join(directory, 'missing'))).rejects.toThrow(
      'ENOENT',
    )
  })
})
