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
