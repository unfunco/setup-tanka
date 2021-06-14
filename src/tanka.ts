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
import {chmod} from '@actions/io/lib/io-util';
import * as tc from '@actions/tool-cache';
import * as semver from 'semver';
import path from 'path';

export async function install(version: string): Promise<void> {
  const semanticVersion = formatVersion(version);

  core.info(`Downloading Grafana Tanka ${semanticVersion}`);
  const tkDownload = await tc.downloadTool(
    `https://github.com/grafana/tanka/releases/download/${semanticVersion}/tk-linux-amd64`,
    undefined
  );

  const tkDownloadPath = path.basename(tkDownload);
  const tkPath = path.join(tkDownloadPath, 'tk');

  core.info(`Making ${tkPath} executable`);
  await io.mv(tkDownload, tkPath);
  await chmod(tkPath, 0o755);

  core.info(`Adding ${tkDownloadPath} to PATH`);
  core.addPath(tkDownloadPath);
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
