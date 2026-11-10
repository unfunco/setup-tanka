// SPDX-FileCopyrightText: 2026 Daniel Morris <daniel@honestempire.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import { chmod } from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as tanka from '../src/tanka.ts'

vi.mock('@actions/core')
vi.mock('@actions/tool-cache')
vi.mock('node:fs/promises')
vi.mock('node:os')

const downloadPath = path.resolve('/runner/temp/download')
const toolPath = path.resolve('/runner/tool-cache/tanka/0.16.0/x64')

describe('GitHub Actions × Grafana Tanka', () => {
  beforeEach(() => {
    vi.mocked(os.arch).mockReturnValue('x64')
    vi.mocked(os.platform).mockReturnValue('linux')
    vi.mocked(tc.find).mockReturnValue('')
    vi.mocked(tc.downloadTool).mockResolvedValue(downloadPath)
    vi.mocked(tc.cacheFile).mockResolvedValue(toolPath)
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
    'downloads the correct executable for %s/%s',
    async (platform, arch, exe) => {
      vi.mocked(os.arch).mockReturnValue(arch)
      vi.mocked(os.platform).mockReturnValue(platform)

      await tanka.install('0.16.0')

      expect(tc.downloadTool).toHaveBeenCalledWith(
        `https://github.com/grafana/tanka/releases/download/v0.16.0/${exe}`,
      )
    },
  )

  it.each([
    ['linux', 'tk'],
    ['darwin', 'tk'],
    ['win32', 'tk.exe'],
  ] as const)(
    'caches the download as an executable on %s',
    async (platform, exe) => {
      vi.mocked(os.platform).mockReturnValue(platform)

      await tanka.install('0.16.0')

      expect(tc.cacheFile).toHaveBeenCalledWith(
        downloadPath,
        exe,
        'tanka',
        'v0.16.0',
      )
      expect(chmod).toHaveBeenCalledWith(path.join(toolPath, exe), 0o755)
    },
  )

  it('adds the absolute tool cache directory to PATH', async () => {
    await tanka.install('0.16.0')

    expect(core.addPath).toHaveBeenCalledExactlyOnceWith(toolPath)
    expect(path.isAbsolute(toolPath)).toBe(true)
  })

  it('does not download a version that is already cached', async () => {
    vi.mocked(tc.find).mockReturnValue(toolPath)

    await tanka.install('0.16.0')

    expect(tc.find).toHaveBeenCalledWith('tanka', 'v0.16.0')
    expect(tc.downloadTool).not.toHaveBeenCalled()
    expect(tc.cacheFile).not.toHaveBeenCalled()
    expect(core.addPath).toHaveBeenCalledExactlyOnceWith(toolPath)
  })
})
