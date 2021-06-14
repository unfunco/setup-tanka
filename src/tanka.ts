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

import * as tc from '@actions/tool-cache';
import * as semver from 'semver';

export async function download(version: string) {
  const downloadUrl = getDownloadUrl(version, 'linux', 'amd64');
  return await tc.downloadTool(downloadUrl);
}

export function getDownloadUrl(version: string, os: string, arch: string): string {
  return `https://github.com/grafana/tanka/releases/download/${version}/tk-${os}-${arch}`;
}

// Formats a requested version number into a valid semantic version number
// format used by the Grafana team when creating releases.
// Adapted from:
// https://github.com/actions/setup-go/blob/3b4dc6cbed1779f759b9c638cb83696acea809d1/src/installer.ts#L259
export function formatVersion(version: string): string {
  let parts: string[] = version.split('-')

  let versionPart: string = parts[0];
  let preReleasePart: string = parts.length > 1 ? `-${parts[1]}` : '';

  // Convert 0.16 to 0.16.0
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

  // Convert 0.16.0 to v0.16.0
  if ('v' !== versionPart.substr(0, 1)) {
    versionPart = `v${versionPart}`;
  }

  return `${versionPart}${preReleasePart}`;
}
