// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { main } from '../src/main.ts'
import * as tanka from '../src/tanka.ts'

vi.mock('@actions/core')
vi.mock('../src/tanka.ts')

describe('main', () => {
  beforeEach(() => {
    vi.mocked(tanka.install).mockResolvedValue({
      cacheHit: false,
      version: '0.36.3',
    })
  })

  it('installs the requested version with the token', async () => {
    vi.mocked(core.getInput).mockImplementation(
      (name) => ({ 'tanka-version': '0.36.3', token: 'token' })[name] ?? '',
    )

    await main()

    expect(tanka.install).toHaveBeenCalledExactlyOnceWith('0.36.3', 'token')
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('outputs the installed version and whether it was cached', async () => {
    vi.mocked(tanka.install).mockResolvedValue({
      cacheHit: true,
      version: '0.36.0',
    })

    await main()

    expect(core.setOutput).toHaveBeenCalledWith('cache-hit', true)
    expect(core.setOutput).toHaveBeenCalledWith('tanka-version', '0.36.0')
  })

  it('fails the step when the installation throws an error', async () => {
    vi.mocked(tanka.install).mockRejectedValue(new Error('no such version'))

    await main()

    expect(core.setFailed).toHaveBeenCalledExactlyOnceWith('no such version')
    expect(core.setOutput).not.toHaveBeenCalled()
  })

  it('fails the step when the installation throws something else', async () => {
    vi.mocked(tanka.install).mockRejectedValue('socket hang up')

    await main()

    expect(core.setFailed).toHaveBeenCalledExactlyOnceWith('socket hang up')
  })
})
