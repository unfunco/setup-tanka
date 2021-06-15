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
import * as semver from 'semver';
import path from 'path';
import * as os from 'os';

export async function install(version: string): Promise<void> {
  const semanticVersion = formatVersion(version);
  const executableName = getExecutableName();
  const tkDownloadUrl = `https://github.com/grafana/tanka/releases/download/${semanticVersion}/${executableName}`;

  core.info(`Download Grafana Tanka ${semanticVersion} from ${tkDownloadUrl}`);
  const tkDownload = await tc.downloadTool(tkDownloadUrl, undefined);

  const tkDownloadPath = path.basename(tkDownload);
  const tk = path.join(tkDownloadPath, 'tk');

  core.debug(`Move ${tkDownload} to ${tk}`);
  await io.mv(tkDownload, tk);

  core.debug(`Make ${tk} executable`);
  await ioutil.chmod(tk, 0o755);

  core.debug(`Add ${tkDownloadPath} to PATH`);
  core.addPath(tkDownloadPath);
}

function getExecutableName(): string {
  let arch = os.arch();
  let ext = '';
  let platform = os.platform().toString();

  if (arch === 'x64') {
    arch = 'amd64';
  }

  if (platform === 'win32') {
    platform = 'windows';
    ext = '.exe';
  }

  return `tk-${platform}-${arch}${ext}`;
}

function formatVersion(version: string): string {
  let parts: string[] = version.split('-');
  let versionPart: string = parts[0];
  let preReleasePart: string = parts.length > 1 ? `-${parts[1]}` : '';

  // Convert X.Y to X.Y.0
  let versionParts: string[] = versionPart.split('.');
  if (versionParts.length === 2) {
    versionPart += '.0';
  }

  // 0.16.0 appears to be the first version with releases for different
  // platforms and architectures, so to make things easy, only support
  // versions greater than or equal to 0.16.0.
  if (semver.lt(versionPart, '0.16.0')) {
    throw new Error('Only versions >= 0.16.0 are supported');
  }

  // Convert X.Y.Z to vX.Y.Z
  if ('v' !== versionPart.substr(0, 1)) {
    versionPart = `v${versionPart}`;
  }

  return `${versionPart}${preReleasePart}`;
}
