import * as core from '@actions/core';
import * as io from '@actions/io';
import * as tanka from './tanka';
import cp from 'child_process';
import path from 'path';

export async function main() {
  try {
    const specifiedTankaVersion = core.getInput('tanka-version');

    const downloadPath = await tanka.downloadVersion(specifiedTankaVersion);
    core.addPath(path.dirname(downloadPath));

    const tk = await io.which('tk');
    const installedTankaVersion = (cp.execSync(`${tk} --version`)).toString();
    core.info(installedTankaVersion);
  } catch (e) {
    core.setFailed(e.message);
  }
}
