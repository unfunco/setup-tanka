// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core'
import { describe, expect, it, vi } from 'vitest'
import { main } from '../src/main.ts'
import * as tanka from '../src/tanka.ts'

vi.mock('@actions/core')
vi.mock('../src/tanka.ts')

describe('main', () => {
  it('installs the requested version', async () => {
    vi.mocked(core.getInput).mockReturnValue('0.36.3')

    await main()

    expect(core.getInput).toHaveBeenCalledWith('tanka-version')
    expect(tanka.install).toHaveBeenCalledExactlyOnceWith('0.36.3')
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('fails the step when the installation throws an error', async () => {
    vi.mocked(tanka.install).mockRejectedValue(new Error('no such version'))

    await main()

    expect(core.setFailed).toHaveBeenCalledExactlyOnceWith('no such version')
  })

  it('fails the step when the installation throws something else', async () => {
    vi.mocked(tanka.install).mockRejectedValue('socket hang up')

    await main()

    expect(core.setFailed).toHaveBeenCalledExactlyOnceWith('socket hang up')
  })
})
