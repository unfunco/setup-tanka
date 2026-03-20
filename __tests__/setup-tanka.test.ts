// Copyright © 2021 Daniel Morris
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at:
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { jest } from '@jest/globals'

const core = {
  addPath: jest.fn<(path: string) => void>(),
  debug: jest.fn<(message: string) => void>(),
  info: jest.fn<(message: string) => void>(),
}

const io = {
  mv: jest.fn<(source: string, destination: string) => Promise<void>>(),
}

const ioutil = {
  chmod: jest.fn<(path: string, mode: number) => Promise<void>>(),
}

const tc = {
  downloadTool: jest.fn<(url: string, dest?: string) => Promise<string>>(),
}

const os = {
  arch: jest.fn<() => string>(),
  platform: jest.fn<() => NodeJS.Platform>(),
}

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/io', () => io)
jest.unstable_mockModule('@actions/io/lib/io-util', () => ioutil)
jest.unstable_mockModule('@actions/tool-cache', () => tc)
jest.unstable_mockModule('os', () => os)

const tanka = await import('../src/tanka')

describe('GitHub Actions × Grafana Tanka', () => {
  const runtime = {
    arch: '',
    platform: '' as NodeJS.Platform,
  }

  beforeAll(() => {
    process.env['GITHUB_PATH'] = ''
    console.log('::stop-commands::stoptoken')
  })

  beforeEach((): void => {
    jest.resetAllMocks()

    os.arch.mockImplementation(() => runtime['arch'])
    os.platform.mockImplementation(() => runtime['platform'])

    ioutil.chmod.mockImplementation(async (): Promise<void> => void 0)
    core.addPath.mockImplementation((_path: string): void => void 0)
    core.debug.mockImplementation((_line: string): void => void 0)
    core.info.mockImplementation((_line: string): void => void 0)
    tc.downloadTool.mockImplementation(async (): Promise<string> => '/temp')
    io.mv.mockImplementation(async (): Promise<void> => void 0)
  })

  afterAll((): void => {
    console.log('::stoptoken::')
  }, 100000)

  afterEach((): void => {
    jest.clearAllMocks()
  })

  it('does not install versions prior to 0.16.0', async (): Promise<void> => {
    await expect(tanka.install('0.15.0')).rejects.toThrow(
      'Only versions >= 0.16.0 are supported',
    )
  })

  test.each([
    ['linux', 'amd64', 'tk-linux-amd64'],
    ['linux', 'arm', 'tk-linux-arm'],
    ['linux', 'arm64', 'tk-linux-arm64'],
    ['darwin', 'arm64', 'tk-darwin-arm64'],
    ['win32', 'amd64', 'tk-windows-amd64.exe'],
    ['win32', 'x64', 'tk-windows-amd64.exe'],
  ])(
    'installs the correct executable for %s/%s',
    async (platform, arch, exe): Promise<void> => {
      runtime.platform = platform as NodeJS.Platform
      runtime.arch = arch
      await tanka.install('0.16.0')

      expect(tc.downloadTool).toHaveBeenCalledWith(
        `https://github.com/grafana/tanka/releases/download/v0.16.0/${exe}`,
        undefined,
      )
    },
  )
})
