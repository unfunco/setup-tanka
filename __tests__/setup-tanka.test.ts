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
import * as tc from '@actions/tool-cache';
import * as tanka from '../src/tanka';

// @ts-ignore
import osm from 'os';

describe('GitHub Actions × Grafana Tanka', () => {
  let inputs = {} as any;
  let os = {} as any;

  let archSpy: jest.SpyInstance;
  let downloadToolSpy: jest.SpyInstance;
  let inputSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let platformSpy: jest.SpyInstance;

  beforeEach(() => {
    inputs = {};
    inputSpy = jest.spyOn(core, 'getInput');
    inputSpy.mockImplementation(name => inputs[name]);

    archSpy = jest.spyOn(osm, 'arch');
    archSpy.mockImplementation(() => os['arch']);
    platformSpy = jest.spyOn(osm, 'platform');
    platformSpy.mockImplementation(() => os['platform']);

    downloadToolSpy = jest.spyOn(tc, 'downloadTool');

    logSpy = jest.spyOn(core, 'info');
    logSpy.mockImplementation(_line => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('does not install versions prior to 0.16.0', async () => {
    await expect(tanka.install('0.15.0')).rejects.toThrowError(
      'Only versions >= 0.16.0 are supported',
    );
  });
});
