import * as core from '@actions/core';
import * as io from '@actions/io';
import { chmod } from '@actions/io/lib/io-util';
import * as tanka from './tanka';
import cp from 'child_process';
import path from 'path';

export async function main() {
  try {
    const specifiedTankaVersion = core.getInput('tanka-version');

    core.startGroup('Download');

    core.info(`Downloading Grafana Tanka ${specifiedTankaVersion}`);
    const tkDownload = await tanka.downloadVersion(specifiedTankaVersion);

    const tkDownloadPath = path.basename(tkDownload);
    const tkPath = path.join(tkDownloadPath, 'tk');

    core.endGroup();

    core.startGroup('Configure');

    core.info(`Moving ${tkDownload} to ${tkPath}`);
    await io.mv(tkDownload, tkPath);
    await chmod(tkPath, 0o755);

    core.info(`Adding ${tkDownloadPath} to PATH`);
    core.addPath(tkDownloadPath);

    core.endGroup();

    const installedTankaVersion = (cp.execSync(`tk --version`)).toString();
    core.info(installedTankaVersion);
  } catch (e) {
    core.setFailed(e.message);
  }
}
