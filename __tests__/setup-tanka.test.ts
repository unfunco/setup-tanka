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

import * as core from '@actions/core'
import * as io from '@actions/io'
import * as ioutil from '@actions/io/lib/io-util'
import * as tc from '@actions/tool-cache'
import * as tanka from '../src/tanka'

// @ts-ignore
import osm from 'os'

describe('GitHub Actions × Grafana Tanka', () => {
  let os = {} as any

  let archSpy: jest.SpyInstance
  let chmodSpy: jest.SpyInstance
  let consoleSpy: jest.SpyInstance
  let debugSpy: jest.SpyInstance
  let downloadToolSpy: jest.SpyInstance
  let logSpy: jest.SpyInstance
  let mvSpy: jest.SpyInstance
  let platformSpy: jest.SpyInstance

  beforeAll(() => {
    process.env['GITHUB_PATH'] = ''
    console.log('::stop-commands::stoptoken')
  })

  beforeEach(() => {
    archSpy = jest.spyOn(osm, 'arch')
    archSpy.mockImplementation(() => os['arch'])
    platformSpy = jest.spyOn(osm, 'platform')
    platformSpy.mockImplementation(() => os['platform'])

    chmodSpy = jest.spyOn(ioutil, 'chmod')
    chmodSpy.mockImplementation(async (): Promise<void> => {})
    consoleSpy = jest.spyOn(process.stdout, 'write')
    debugSpy = jest.spyOn(core, 'debug')
    debugSpy.mockImplementation((_line) => {})
    downloadToolSpy = jest.spyOn(tc, 'downloadTool')
    logSpy = jest.spyOn(core, 'info')
    logSpy.mockImplementation((_line) => {})
    mvSpy = jest.spyOn(io, 'mv')
    mvSpy.mockImplementation(async (): Promise<void> => {})
  })

  afterAll(() => {
    console.log('::stoptoken::')
  }, 100000)

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('does not install versions prior to 0.16.0', async () => {
    await expect(tanka.install('0.15.0')).rejects.toThrowError(
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
    async (platform, arch, exe) => {
      os.platform = platform
      os.arch = arch

      downloadToolSpy.mockImplementation(() => '/temp')
      await tanka.install('0.16.0')

      expect(downloadToolSpy).toHaveBeenCalledWith(
        `https://github.com/grafana/tanka/releases/download/v0.16.0/${exe}`,
        undefined,
      )
    },
  )
})
