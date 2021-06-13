import * as core from '@actions/core';
import * as io from '@actions/io';
import * as tanka from './tanka';
import cp from 'child_process';

export async function main() {
  try {
    const specifiedTankaVersion = core.getInput('tanka-version');
    core.info(`Specified Tanka version: ${specifiedTankaVersion}`);

    const downloadPath = await tanka.installVersion(specifiedTankaVersion);
    core.addPath(downloadPath);

    let tk = await io.which('tk');
    let installedTankaVersion = (cp.execSync(`${tk} --version`)).toString();
    core.info(installedTankaVersion);
  } catch (e) {
    core.setFailed(e.message);
  }
}
