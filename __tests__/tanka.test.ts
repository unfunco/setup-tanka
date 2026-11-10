// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import * as tc from '@actions/tool-cache'
import * as os from 'node:os'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tanka from '../src/tanka.ts'

vi.mock('@actions/core')
vi.mock('@actions/io')
vi.mock('@actions/io/lib/io-util')
vi.mock('@actions/tool-cache')
vi.mock('node:os')

describe('GitHub Actions × Grafana Tanka', () => {
  beforeEach(() => {
    vi.mocked(os.arch).mockReturnValue('x64')
    vi.mocked(os.platform).mockReturnValue('linux')
    vi.mocked(tc.downloadTool).mockResolvedValue('/temp')
  })

  it('does not install versions prior to 0.16.0', async () => {
    await expect(tanka.install('0.15.0')).rejects.toThrow(
      'Only versions >= 0.16.0 are supported',
    )
  })

  it.each([
    ['linux', 'x64', 'tk-linux-amd64'],
    ['linux', 'arm', 'tk-linux-arm'],
    ['linux', 'arm64', 'tk-linux-arm64'],
    ['darwin', 'x64', 'tk-darwin-amd64'],
    ['darwin', 'arm64', 'tk-darwin-arm64'],
    ['win32', 'x64', 'tk-windows-amd64.exe'],
  ] as const)(
    'installs the correct executable for %s/%s',
    async (platform, arch, exe) => {
      vi.mocked(os.arch).mockReturnValue(arch)
      vi.mocked(os.platform).mockReturnValue(platform)

      await tanka.install('0.16.0')

      expect(tc.downloadTool).toHaveBeenCalledWith(
        `https://github.com/grafana/tanka/releases/download/v0.16.0/${exe}`,
        undefined,
      )
    },
  )
})
