// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

// Compute the SHA-256 digest of a file, in the algorithm:hex form that GitHub
// uses for the digests of release assets.
export async function sha256(file: string): Promise<string> {
  const hash = createHash('sha256')
  await pipeline(createReadStream(file), hash)

  return `sha256:${hash.digest('hex')}`
}
