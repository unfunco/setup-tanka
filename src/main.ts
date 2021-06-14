import * as core from '@actions/core';
import * as io from '@actions/io';
import { chmod } from '@actions/io/lib/io-util';
import * as tanka from './tanka';
import cp from 'child_process';
import path from 'path';

export async function main() {
  try {
    const specifiedTankaVersion = core.getInput('tanka-version');
    const tankaDownload = await tanka.downloadVersion(specifiedTankaVersion);
    const tankaDownloadPath = path.basename(tankaDownload);
    const tkPath = path.join(tankaDownloadPath, 'tk');

    await io.mv(tankaDownload, tkPath);
    await chmod(tkPath, 0o755);

    core.addPath(tankaDownloadPath);

    const installedTankaVersion = (cp.execSync(`tk --version`)).toString();
    core.info(installedTankaVersion);
  } catch (e) {
    core.setFailed(e.message);
  }
}
