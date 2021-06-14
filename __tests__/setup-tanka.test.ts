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

import * as core from '@actions/core';
import * as io from '@actions/io';
import * as ioutil from '@actions/io/lib/io-util';
import * as tc from '@actions/tool-cache';
import * as tanka from '../src/tanka';

// @ts-ignore
import osm from 'os';

describe('GitHub Actions × Grafana Tanka', () => {
  let os = {} as any;

  let archSpy: jest.SpyInstance;
  let chmodSpy: jest.SpyInstance;
  let consoleSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;
  let downloadToolSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let mvSpy: jest.SpyInstance;
  let platformSpy: jest.SpyInstance;

  beforeEach(() => {
    archSpy = jest.spyOn(osm, 'arch');
    archSpy.mockImplementation(() => os['arch']);
    platformSpy = jest.spyOn(osm, 'platform');
    platformSpy.mockImplementation(() => os['platform']);

    chmodSpy = jest.spyOn(ioutil, 'chmod');
    downloadToolSpy = jest.spyOn(tc, 'downloadTool');
    mvSpy = jest.spyOn(io, 'mv');

    chmodSpy.mockImplementation(async (): Promise<void> => {});
    consoleSpy = jest.spyOn(process.stdout, 'write');
    debugSpy = jest.spyOn(core, 'debug');
    debugSpy.mockImplementation(_line => {});
    logSpy = jest.spyOn(core, 'info');
    logSpy.mockImplementation(_line => {});
    mvSpy.mockImplementation(async (): Promise<void> => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('does not install versions prior to 0.16.0', async () => {
    await expect(tanka.install('0.15.0')).rejects.toThrowError(
      'Only versions >= 0.16.0 are supported'
    );
  });

  it('installs linux/amd64 versions', async () => {
    os.platform = 'linux';
    os.arch = 'amd64';

    downloadToolSpy.mockImplementation(
      () => '/home/runner/work/_temp/ddb10bd3-6898-4b4b-b1b6-614fca44d420'
    );

    await tanka.install('v0.16.0');
    let expectedPath: string = 'ddb10bd3-6898-4b4b-b1b6-614fca44d420';

    expect(downloadToolSpy).toHaveBeenCalledWith(
      'https://github.com/grafana/tanka/releases/download/v0.16.0/tk-linux-amd64',
      undefined
    );

    expect(mvSpy).toHaveBeenCalled();
    expect(chmodSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      `::add-path::${expectedPath}${osm.EOL}`
    );
  });

  it('installs linux/arm versions', async () => {
    os.platform = 'linux';
    os.arch = 'arm';

    downloadToolSpy.mockImplementation(() => '/');

    await tanka.install('0.16.0');

    expect(downloadToolSpy).toHaveBeenCalledWith(
      'https://github.com/grafana/tanka/releases/download/v0.16.0/tk-linux-arm',
      undefined
    );
  });

  it('installs linux/arm64 versions', async () => {
    os.platform = 'linux';
    os.arch = 'arm64';

    downloadToolSpy.mockImplementation(() => '/');

    await tanka.install('0.16.0');

    expect(downloadToolSpy).toHaveBeenCalledWith(
      'https://github.com/grafana/tanka/releases/download/v0.16.0/tk-linux-arm64',
      undefined
    );
  });

  it('installs darwin/arm64 versions', async () => {
    os.platform = 'darwin';
    os.arch = 'arm64';

    downloadToolSpy.mockImplementation(() => '/');

    await tanka.install('0.16.0');

    expect(downloadToolSpy).toHaveBeenCalledWith(
      'https://github.com/grafana/tanka/releases/download/v0.16.0/tk-darwin-arm64',
      undefined
    );
  });

  it('installs windows/amd64 versions', async () => {
    os.platform = 'win32';
    os.arch = 'amd64';

    downloadToolSpy.mockImplementation(() => '/');

    await tanka.install('0.16.0');

    expect(downloadToolSpy).toHaveBeenCalledWith(
      'https://github.com/grafana/tanka/releases/download/v0.16.0/tk-windows-amd64.exe',
      undefined
    );
  });

  it('installs windows/x64 versions', async () => {
    os.platform = 'linux';
    os.arch = 'x64';

    downloadToolSpy.mockImplementation(() => '/');

    await tanka.install('0.16.0');

    expect(downloadToolSpy).toHaveBeenCalledWith(
      'https://github.com/grafana/tanka/releases/download/v0.16.0/tk-linux-amd64',
      undefined
    );
  });
});
