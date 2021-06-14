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
import { chmod } from '@actions/io/lib/io-util';
import * as tanka from './tanka';
import path from 'path';

export async function main() {
  try {
    const requestedVersion: string = core.getInput('tanka-version');
    const version: string = tanka.formatVersion(requestedVersion);

    core.startGroup('Download Grafana Tanka');

    core.info(`Downloading Grafana Tanka ${version}`);
    const tkDownload = await tanka.download(version);

    core.endGroup();

    core.startGroup('Prepare Grafana Tanka');

    const tkDownloadPath = path.basename(tkDownload);
    const tkPath = path.join(tkDownloadPath, 'tk');

    core.info(`Moving ${tkDownload} to ${tkPath}`);
    await io.mv(tkDownload, tkPath);
    await chmod(tkPath, 0o755);

    core.info(`Adding ${tkDownloadPath} to PATH`);
    core.addPath(tkDownloadPath);

    core.endGroup();
  } catch (e) {
    core.setFailed(e.message);
  }
}
